module HtmlParser.HtmlParser exposing
    ( parseHtml
    , Node(Element, Text)
    -- , main
    , tests
    )


--------------------------------------------------------------------------------
-- EXTERNAL DEPENDENCIES
--------------------------------------------------------------------------------
import Dict exposing (Dict)
import ElmTest exposing (..)
import Maybe exposing (Maybe)


--------------------------------------------------------------------------------
-- INTERNAL DEPENDENCIES
--------------------------------------------------------------------------------

import HtmlParser.HtmlParserRawAst exposing (xhtmlToRawAst)
import Parser.Parser exposing
    ( ParseResult
        ( ParseMatchesReturnsResult
        , ParseMatchesReturnsNothing
        , ParseDoesNotMatch
        )
    , AstNode(LabelledAstNode, UnlabelledAstNode)
    , AstNodeValue(AstLeaf, AstChildren)
    )
import Parser.ParserHelpers exposing
    ( concatLeafs
    , listToPair
    , unpackStringFromNode
    , unpackListFromNode
    , unpackStringsFromNode
    , getLabel
    , unsafeHead
    , unsafeTail
    )


--------------------------------------------------------------------------------
-- TYPES
--------------------------------------------------------------------------------

type Node =
    Element
        {
            tagName: String,
            attributes: Dict String String,
            children: List Node
        }
    |
    Text String


type AstNodeType = OpeningTagAstNode | ClosingTagAstNode | SelfClosingTagAstNode | TextAstNode


--------------------------------------------------------------------------------
-- MAIN
--------------------------------------------------------------------------------

voidElements : List String
voidElements =
    [ "area"
    , "base"
    , "br"
    , "col"
    , "embed"
    , "hr"
    , "img"
    , "input"
    , "keygen"
    , "link"
    , "menuitem"
    , "meta"
    , "param"
    , "source"
    , "track"
    , "wbr"
    ]


convertTextNode : AstNode -> Node
convertTextNode astNode = Text <| concatLeafs astNode


convertAttributeValue : AstNode -> Node
convertAttributeValue astNode = Text <| concatLeafs astNode


attributeToTuple : AstNode -> (String, String)
attributeToTuple astNode =
    let
        strings = unpackStringsFromNode astNode
    in
        if
            List.length strings == 1
        then
            listToPair (strings ++ [""])
        else
            listToPair strings


attributesToDict : AstNode -> Dict String String
attributesToDict astNode =
    let
        attributes = List.map attributeToTuple (unpackListFromNode astNode)
    in
        Dict.fromList attributes


getTagName : AstNode -> String
getTagName astNode =
    let
        (tagNameNode, attributesNode) = listToPair <| unpackListFromNode astNode
    in
        unpackStringFromNode tagNameNode

convertOpeningTag : AstNode -> Node
convertOpeningTag astNode =
    let
        (tagNameNode, attributesNode) = listToPair <| unpackListFromNode astNode
    in
        Element
            { tagName = unpackStringFromNode tagNameNode
            , attributes = attributesToDict attributesNode
            , children =  []
            }


convertSelfClosingTag = convertOpeningTag  -- it's the same thing!


appendNode : Node -> Node   ->   Node
appendNode node childNode =
    case node of
        Element e ->
            Element { e | children = e.children ++ [childNode] }
        _ -> node  -- don't alter it


astNodeTypeLookup : Dict String AstNodeType
astNodeTypeLookup =
    Dict.fromList
        [ ("OPENING_TAG", OpeningTagAstNode)
        , ("CLOSING_TAG", ClosingTagAstNode)
        , ("TEXT", TextAstNode)
        , ("SELF_CLOSING_TAG", SelfClosingTagAstNode)
        ]


getAstNodeType : AstNode -> AstNodeType
getAstNodeType astNode =
    let
        label = getLabel astNode
    in
        case (Dict.get label astNodeTypeLookup) of
            Just nodeType ->
                case nodeType of
                    OpeningTagAstNode ->
                        if
                            List.member (getTagName astNode) voidElements
                        then
                            SelfClosingTagAstNode
                        else
                            OpeningTagAstNode
                    _ ->
                        nodeType
            Nothing ->
                Debug.crash("")


flatAstToTree : AstNode -> List AstNode   ->   (Node, List AstNode)
flatAstToTree openingTagAstNode astNodes =
    let
        initialNode = convertOpeningTag openingTagAstNode

        flatAstToTree' : Node -> List AstNode   ->   (Node, List AstNode)
        flatAstToTree' currNode remainderAstNodes =
            case remainderAstNodes of
                -- if we run out of astNodes before we find the closing tag,
                -- doesn't matter, just return. No need for
                -- strictness
                [] ->
                    (currNode, [])
                currAstNode::tailAstNodes ->
                    case getAstNodeType currAstNode of
                        TextAstNode ->
                            let
                                newNode = appendNode currNode (convertTextNode currAstNode)
                            in
                                flatAstToTree' newNode tailAstNodes
                        OpeningTagAstNode ->
                            let
                                (elementNode, remainderAstNodes') = flatAstToTree currAstNode tailAstNodes
                                newNode = appendNode currNode elementNode
                            in
                                flatAstToTree' newNode remainderAstNodes'
                        ClosingTagAstNode ->
                            -- Here we get the tag name of the closing tag.
                            -- It should match currNode tagname.
                            -- If not, we can either return an error, or just not care :)
                            -- Let's just not care.
                            (currNode, tailAstNodes)
                        SelfClosingTagAstNode ->
                            let
                                newNode = appendNode currNode (convertSelfClosingTag currAstNode)
                            in
                                flatAstToTree' newNode tailAstNodes

        result = flatAstToTree' initialNode astNodes
    in
        result


astNodeToHtmlNode : AstNode -> Maybe Node
astNodeToHtmlNode astNode =
    let
        astNodes = unpackListFromNode astNode
        headNode = unsafeHead astNodes
        tailNodes = unsafeTail astNodes
    in
        case astNodes of
            [] ->
                Nothing
            headNode::tailNodes ->
                case getAstNodeType headNode of
                    OpeningTagAstNode ->
                        let
                            (node, _) = flatAstToTree headNode tailNodes
                        in
                            Just node
                    _ ->
                        Nothing

parseHtml : String -> Maybe Node
parseHtml s =
    let
        result = xhtmlToRawAst s
    in
        case xhtmlToRawAst s of
            ParseDoesNotMatch ->
                Nothing
            ParseMatchesReturnsResult astNode ->
                astNodeToHtmlNode astNode
            _ -> Debug.crash("")



--------------------------------------------------------------------------------
-- TESTS
--------------------------------------------------------------------------------

testAttribute1 =
    UnlabelledAstNode <| AstChildren
        [
            UnlabelledAstNode <| AstChildren
                [
                    UnlabelledAstNode <| AstLeaf "class"
                ]
            ,
            UnlabelledAstNode <| AstChildren
                [
                    UnlabelledAstNode <| AstLeaf "success",
                    UnlabelledAstNode <| AstLeaf " ",
                    UnlabelledAstNode <| AstLeaf "awesome"
                ]
        ]

testAttribute2 =
    UnlabelledAstNode <| AstChildren
        [
            UnlabelledAstNode <| AstChildren
                [
                    UnlabelledAstNode <| AstLeaf "id"
                ]
            ,
            UnlabelledAstNode <| AstChildren
                [
                    UnlabelledAstNode <| AstLeaf "1"
                ]
        ]

testAttribute3 =
    UnlabelledAstNode <| AstChildren
        [
            UnlabelledAstNode <| AstChildren
                [
                    UnlabelledAstNode <| AstLeaf "data",
                    UnlabelledAstNode <| AstLeaf "-",
                    UnlabelledAstNode <| AstLeaf "name"
                ]
            ,
            UnlabelledAstNode <| AstChildren
                [
                    UnlabelledAstNode <| AstLeaf "elm"
                ]
        ]

testAttributes =
    UnlabelledAstNode <| AstChildren [testAttribute1, testAttribute2]

testAttributes2 =
    UnlabelledAstNode <| AstChildren [testAttribute3]

testOpeningTag =
    LabelledAstNode
        {
            label = "OPENING_TAG",
            value = AstChildren
                [
                    UnlabelledAstNode <| AstLeaf "div",
                    testAttributes
                ]

        }

assumeParseSuccess : ParseResult -> AstNode
assumeParseSuccess parseResult =
    case parseResult of
        ParseMatchesReturnsResult result -> result
        _ -> Debug.crash("")

assumeSuccess : Maybe a -> a
assumeSuccess x =
    case x of
        Just x' -> x'
        _ -> Debug.crash("")

simpleHtmlResult = xhtmlToRawAst "<h1>hello world</h1>"
simpleHtmlAstNode = assumeParseSuccess simpleHtmlResult

nestedHtmlAstNode = assumeParseSuccess <| xhtmlToRawAst "<div><h1>hello world</h1></div>"


tests = suite "HtmlParser.elm"
    [
        test "attributesToDict" (
            assertEqual
                ("class", "success awesome")
                (attributeToTuple testAttribute1)
        )
        ,
        test "attributeToTuple" (
            assertEqual
                (Dict.fromList [("class", "success awesome"), ("id", "1")])
                (attributesToDict testAttributes)
        )
        ,
        test "attributeToTuple (dashed)" (
            assertEqual
                (Dict.fromList [("data-name", "elm")])
                (attributesToDict testAttributes2)
        )
        ,
        test "convertOpeningTag" (
            assertEqual
                (Element
                    {
                        tagName = "div",
                        attributes = (Dict.fromList [("class", "success awesome"), ("id", "1")]),
                        children = []
                    }
                )
                (convertOpeningTag  testOpeningTag)
        )
        ,
        test "appendNode" (
            assertEqual
                (Element
                    {
                        tagName = "div",
                        attributes = (Dict.fromList []),
                        children = [Text "hello"]
                    }
                )
                (appendNode
                    (Element
                        {
                            tagName = "div",
                            attributes = (Dict.fromList []),
                            children = []
                        }
                    )
                    (Text "hello")
                )
        )
        ,
        test "getAstNodeType" (
            assertEqual
                OpeningTagAstNode
                (getAstNodeType testOpeningTag)
        )
        ,
        test "astNodeToHtmlNode" (
            assertEqual
                (Element
                    {
                        tagName="h1",
                        attributes=Dict.empty,
                        children= [Text "hello world"]
                    }
                )
                (assumeSuccess <| astNodeToHtmlNode simpleHtmlAstNode)
        )
        ,
        test "testNestedHtml" (
            assertEqual
                (Element
                    {
                        tagName = "div",
                        attributes = Dict.empty,
                        children = [
                            Element
                                {
                                    tagName = "h1",
                                    attributes = Dict.empty,
                                    children = [Text "hello world"]
                                }
                        ]
                    }
                )
                (assumeSuccess <| astNodeToHtmlNode nestedHtmlAstNode)
        )
        ,
        test "testSelfClosing" (
            assertEqual
                (Element
                    {
                        tagName = "div",
                        attributes = Dict.fromList [],
                        children = [
                            Element
                                {
                                    tagName = "img",
                                    attributes = Dict.fromList [("src","test.jpg")],
                                    children = []
                                }
                            ]
                    }
                )
                (assumeSuccess <| astNodeToHtmlNode <| assumeParseSuccess <| xhtmlToRawAst """<div><img src="test.jpg"/></div>""")
        )
        , test "boolean attribute"
            ( assertEqual
                (Element
                    { tagName = "div"
                    , attributes = Dict.fromList [("disabled","")]
                    , children = []
                    }
                )
                (assumeSuccess <| astNodeToHtmlNode <| assumeParseSuccess <| xhtmlToRawAst """<div disabled></div>""")
        )
    ]

main =
    runSuiteHtml tests
