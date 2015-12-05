module HtmlToElm.HtmlToElm (..) where

--------------------------------------------------------------------------------
-- EXTERNAL DEPENDENCIES
--------------------------------------------------------------------------------
import Dict exposing (Dict)
import String
import ElmTest exposing (..)
import Maybe exposing (Maybe)
import Regex exposing (regex)

--------------------------------------------------------------------------------
-- INTERNAL DEPENDENCIES
--------------------------------------------------------------------------------

import HtmlParser.HtmlParser exposing (
        parseHtml,
        Node(Element, Text)
    )
import HtmlToElm.ElmHtmlWhitelists exposing (..)


--------------------------------------------------------------------------------
-- TYPES
--------------------------------------------------------------------------------

type IndentTree = IndentTreeLeaf String | IndentTrees (List IndentTree)

type alias IndentFunction = Int -> Int -> String   ->   String


--------------------------------------------------------------------------------
-- MAIN
--------------------------------------------------------------------------------


renderAttribute : (String, String) -> String
renderAttribute (key, value) =
    if
        List.member key implementedAttributeFunctions

    then
        key ++ " " ++ "\"" ++ value ++ "\""
    else
        if
            List.member key reservedWords
        then
            key ++ "' " ++ "\"" ++ value ++ "\""
        else
            "attribute \"" ++ key ++ "\""  ++ " \"" ++ value ++ "\""
-- TODO: look this app in the attributes whitelist

indent : IndentFunction
indent spacesPerIndent indentLevel s =
    let
        spaces = spacesPerIndent * indentLevel
        listOfSpaces = List.repeat spaces " "
    in
        (String.join "" listOfSpaces) ++ s

renderAttributes : Dict String String   ->   String
renderAttributes attributes =
    let
        attributesList = Dict.toList attributes
        attributeListString = List.map renderAttribute attributesList
        innards = String.join ", " attributeListString
    in
        case innards of
            "" -> "[]"
            _ -> "[ " ++ innards ++ " ]"


renderTextNode : Node -> String
renderTextNode node =
    case node of
        Text text ->
            "text \"" ++ (removeNewlines text) ++ "\""
        _ ->
            Debug.crash("")

-- renderLeafElement : Node -> String
-- renderLeafElement node =
--     case node of
--         Element {tagName, attributes, children} ->
--             let
--                 childText = case children of
--                     [] -> "[]"
--                     textNode::_ -> "[" ++ renderTextNode textNode ++ "]"
--             in
--                 String.join " " [tagName, renderAttributes attributes, childText]


renderTagFunctionHead : String -> String
renderTagFunctionHead tagName =
    if
        List.member tagName implementedTagFunctions
    then
        tagName
    else
        if
            List.member tagName reservedWords
        then
            tagName ++ "'"
        else
            "node \""  ++ tagName ++ "\""

renderVerticalChild : Node -> IndentTree
renderVerticalChild node =
    case node of
        Element {tagName, attributes, children} ->
            let
                firstLine =
                    (renderTagFunctionHead tagName) ++ " " ++ (renderAttributes attributes)
                childrenLines =
                    case children of
                        [] -> [IndentTreeLeaf "[]"]
                        _ -> formatHaskellMultilineList (List.map renderNode children)

            in
                IndentTrees
                    [ IndentTreeLeaf firstLine
                    , IndentTrees childrenLines
                    ]
        Text s ->
            IndentTreeLeaf <| renderTextNode node

-- -- "concat union" function?
-- concatUnion

verticallyRenderChildren : List Node -> IndentTree
verticallyRenderChildren nodes =
    IndentTrees (List.map renderVerticalChild nodes)


renderNode : Node -> IndentTree
renderNode node =
    -- case node of
    --     Element node ->
    --         renderVerticalChild node
    --         verticallyRenderChildren children
    --     Text s ->
    --         IndentTreeLeaf s
    renderVerticalChild node
    -- case node of
    --     Text s -> IndentTreeLeaf renderTextNode
    --     Element e -> renderVerticalChild


indentTreeStrings : Int -> IndentTree   ->   IndentTree
indentTreeStrings spacesPerIndent originalTree =
    let
        indentTreeStrings' depth currTree =
            let indentLevel = depth // 2  -- we only want to increase the indent every second second level we go down the tree
            in
            case currTree of
                IndentTreeLeaf s ->
                    IndentTreeLeaf (indent spacesPerIndent indentLevel s)
                IndentTrees trees ->
                    IndentTrees (List.map (indentTreeStrings' (depth + 1)) trees)
    in
        indentTreeStrings' 0 originalTree


flattenIndentTree : IndentTree -> List String
flattenIndentTree indentTree =
    let
        flattenIndentTree' : IndentTree -> List String   ->   List String
        flattenIndentTree' indentTree acc =
            (flattenIndentTree indentTree) ++ acc
    in
        case indentTree of
            IndentTreeLeaf s -> [s]
            IndentTrees trees ->
                List.foldr flattenIndentTree' [] trees


htmlNodeToElm : Int -> Node   ->   String
htmlNodeToElm spacesPerIndent node =
    String.join "\n"
        <| flattenIndentTree
        <| indentTreeStrings spacesPerIndent
        <| renderNode node



removeNewlines : String -> String
removeNewlines s =
    Regex.replace Regex.All (regex "\n") (\_ -> "") s


formatHaskellMultilineList : List IndentTree -> List IndentTree
formatHaskellMultilineList indentTrees =
    -- 1. prepend "[ " to first item
    -- 2. prepend ", " to tail items
    -- 3 append a line with "]"
    let
        transformHeadLine : IndentTree -> IndentTree
        transformHeadLine indentTree' =
            case indentTree' of
                IndentTreeLeaf s ->
                    IndentTreeLeaf <| "[ " ++ s
                IndentTrees (headTree::tailTrees) ->
                    IndentTrees <| [transformHeadLine headTree] ++ tailTrees
                IndentTrees [] ->
                    Debug.crash("")

        transformTailLine : IndentTree -> IndentTree
        transformTailLine indentTree' =
            case indentTree' of
                IndentTreeLeaf s ->
                    IndentTreeLeaf <| ", " ++ s
                IndentTrees (headTree::tailTrees) ->
                    IndentTrees <| [transformTailLine headTree] ++ tailTrees
                IndentTrees [] ->
                    Debug.crash("")
    in
        case indentTrees of
            headTree::[] ->
                -- here we need a tree size function, that traverse the tree
                -- if the headTree is a leaf, then run transformHeadlINe and add "]" to end
                case headTree of
                    IndentTreeLeaf s ->
                        [IndentTreeLeaf <| "[ " ++ s ++ " ]"]
                    _ ->
                        [transformHeadLine headTree]
            headTree::tailTrees ->
                [transformHeadLine headTree]
                    ++ (List.map transformTailLine tailTrees)
                    ++ [IndentTreeLeaf "]"]
            _ ->
                indentTrees


htmlToElm : Int -> String   ->  Maybe String
htmlToElm spacesPerIndent s =
    if
        s == ""
    then
        Just ""
    else
        case parseHtml s of
            Just htmlNode ->
                Just (htmlNodeToElm spacesPerIndent <| htmlNode)
            Nothing ->
                Nothing



-- we need a function to traverse the tree and indent every string depending on depth
-- then you flatten the tree, then join by newline

-- renderTailElementWithChildren node indentLevel =
--     case node of
--         Element {tagName, attributes, children} ->
--             let
--                 firstLine = indent indentLevel (", " ++ tagName)
--                 nextIndentLevel = indentLevel + 1
--                 renderedAttributes = indent nextIndentLevel (renderAttributes attributes)
--                 children = indent nextIndentLevel "[]"
--             in
--                 String.join "\n" [firstLine, renderedAttributes, children]


-- Example:
-- view : Address Action -> Model -> Html
-- view address model =
--   div [class "login-wrapper"][
--     div [class "panel panel-default center-block", style [("max-width", "500px")]][
--       div [class "panel-heading"][
--         h2 [class "panel-title"] [text "please login"]
--       ]
--       , div [class "panel-body"][
--         Html.form [class "form-horizontal col-md-12", action "/api/login", method "POST"][
--           div [class "form-group row"][
--             label [class "col-sm-2 control-label"] [text "Mail"]
--             , div [class "col-sm-10"] [
--               input [class "form-control", name "email", value ""][]
--             ]
--           ]
--           , div [class "form-group row"] [
--             label [class "col-sm-2 control-label"][text "Password"]
--             , div [class "col-sm-10"][
--               input [class "form-control", type' "password", name "password", value ""][]
--             ]
--           ]
--           , div [class "text-center"][
--             input [class "login-submit btn btn-primary", type' "submit", value "submit"][]
--           ]
--         ]
--       ]
--     ]
--   ]

-- todoItem address todo =
--     li
--       [ classList [ ("completed", todo.completed), ("editing", todo.editing) ] ]
--       [ div
--           [ class "view" ]
--           [ input
--               [ class "toggle"
--               , type' "checkbox"
--               , checked todo.completed
--               , onClick address (Check todo.id (not todo.completed))
--               ]
--               []
--           , label
--               [ onDoubleClick address (EditingTask todo.id True) ]
--               [ text todo.description ]
--           , button
--               [ class "destroy"
--               , onClick address (Delete todo.id)
--               ]
--               []
--           ]
--       , input
--           [ class "edit"
--           , value todo.description
--           , name "title"
--           , id ("todo-" ++ toString todo.id)
--           , on "input" targetValue (Signal.message address << UpdateTask todo.id)
--           , onBlur address (EditingTask todo.id False)
--           , onEnter address (EditingTask todo.id False)
--           ]
--           []
--       ]
--------------------------------------------------------------------------------
-- TESTS
--------------------------------------------------------------------------------


testAttributes = Dict.fromList [("id", "1"), ("class", "success")]
testLeafElement = Element
    {
        tagName = "div",
        attributes = testAttributes,
        children = []
    }

testLeafElement2 = Element
    {
        tagName = "div",
        attributes = testAttributes,
        children = [Text "hello"]
    }

testLeafElements = List.repeat 3 testLeafElement

testIndentTree =
    IndentTrees [
        IndentTreeLeaf "a",
        IndentTrees
            [
                IndentTreeLeaf "b"
            ]
    ]

tests = suite "HtmlToElm.elm"
    [
        test "renderAttribute" (
            assertEqual
                "class \"success\""
                (renderAttribute ("class", "success"))
        )
        ,
        test "renderAttributes" (
            assertEqual
                "[ class \"success\", id \"1\" ]"
                (renderAttributes <| Dict.fromList [("id", "1"), ("class", "success")])
        )
        ,
        test "renderAttributes" (
            assertEqual
                "[]"
                (renderAttributes <| Dict.fromList [])
        )
        ,
        test "renderTextNode" (
            assertEqual
                "text \"hello\""
                (renderTextNode <| Text "hello")
        )
        ,
        -- test "renderLeafElement" (
        --     assertEqual
        --         "div [class \"success\", id \"1\"] []"
        --         (renderLeafElement testLeafElement)
        -- )
        -- ,
        -- test "renderLeafElement" (
        --     assertEqual
        --         "div [class \"success\", id \"1\"] [text \"hello\"]"
        --         (renderLeafElement testLeafElement2)
        -- )
        -- ,
        test "indent" (
            assertEqual
                "        hello"
                (indent 4 2 "hello")
        )
        ,
        test "indentTree" (
            assertEqual
                (IndentTrees [IndentTreeLeaf "a", IndentTreeLeaf "b"])
                (IndentTrees [IndentTreeLeaf "a", IndentTreeLeaf "b"])
        )
        ,
        test "renderVerticalChild" (
            assertEqual
                (IndentTrees
                    [
                        IndentTreeLeaf "div",
                        IndentTrees
                            [
                                IndentTreeLeaf "[class \"success\", id \"1\"]",
                                IndentTreeLeaf "[]"
                            ]
                    ]
                )
                (renderVerticalChild testLeafElement2)
        )
        ,
        test "indentTreeStrings" (
            assertEqual
                (IndentTreeLeaf "    hello")
                (indentTreeStrings 4 (IndentTreeLeaf "hello"))
        )
        ,
        test "indentTreeStrings" (
            assertEqual
                (IndentTrees ([IndentTreeLeaf ("  a"),IndentTreeLeaf ("  b")]))
                (indentTreeStrings 1 (IndentTrees [IndentTreeLeaf "a", IndentTreeLeaf "b"]))
        )
        ,
        test "indentTreeStrings" (
            assertEqual
                (IndentTrees ([IndentTreeLeaf ("  a"), IndentTrees ([IndentTreeLeaf ("   b")])]))
                (indentTreeStrings 1 testIndentTree)
        )
        ,
        test "flattenIndentTree" (
            assertEqual
                ["a", "b"]
                (flattenIndentTree testIndentTree)
        )
        ,
        test "formatHaskellMultilineList" (
            assertEqual
                [IndentTreeLeaf "[ X", IndentTreeLeaf ", X", IndentTreeLeaf "]"]
                (formatHaskellMultilineList [IndentTreeLeaf "X", IndentTreeLeaf "X"])
        )
        -- ,
        -- test "emptyTag" (
        --     assertEqual
        --         (IndentTrees <|
        --             [
        --                 IndentTreeLeaf "div",
        --                 IndentTrees <|
        --                     [
        --                         IndentTreeLeaf ("[  ]"),
        --                         IndentTreeLeaf ("[  ]")
        --                     ]
        --             ]
        --         )
        --         (renderNode <| parseHtml "<div></div>")
        -- )
        ,
        test "just text" (
            assertEqual
                (IndentTreeLeaf "x")
                (
                    case parseHtml "hello" of
                        Just node -> renderNode node
                        Nothing -> IndentTreeLeaf "x"
                )
        )
    ]

main =
    elementRunner tests
