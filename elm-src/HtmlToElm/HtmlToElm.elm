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

import HtmlParser.HtmlParser exposing
    ( parseHtml
    , Node(Element, Text)
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


verticallyRenderChildren : List Node -> IndentTree
verticallyRenderChildren nodes =
    IndentTrees (List.map renderVerticalChild nodes)


renderNode : Node -> IndentTree
renderNode node =
    renderVerticalChild node


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
