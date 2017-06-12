module HtmlParser.HtmlParserRawAst
    exposing
        ( xhtmlToRawAst
          -- , main
        , tests
        )

--------------------------------------------------------------------------------
-- EXTERNAL DEPENDENCIES
--------------------------------------------------------------------------------

import Legacy.ElmTest exposing (..)


--------------------------------------------------------------------------------
-- INTERNAL DEPENDENCIES
--------------------------------------------------------------------------------

import Parser.Tokenizer exposing (..)
import Parser.Parser
    exposing
        ( ParseResult
            ( ParseMatchesReturnsResult
            , ParseMatchesReturnsNothing
            , ParseDoesNotMatch
            )
        , AstNode(LabelledAstNode, UnlabelledAstNode)
        , AstNodeValue(AstLeaf, AstChildren)
        , createParseSequenceFunction
        , createOptionallyParseMultipleFunction
        , labelled
        , createParseAtLeastOneFunction
        , createParseAnyFunction
        , ignore
        , createParseTokenIgnoreFunction
        , ParseFunction
        , optional
        )
import Parser.ParserHelpers exposing (..)


--------------------------------------------------------------------------------
-- MAIN
--------------------------------------------------------------------------------


parseWordWithDashes : ParseFunction
parseWordWithDashes =
    createParseAtLeastOneFunction <|
        createParseAnyFunction [ parseWordKeep, parseDashKeep ]


parseDoubleQuotedString : ParseFunction
parseDoubleQuotedString =
    createParseAtLeastOneFunction <|
        createParseAnyFunction
            [ parseWordKeep
            , parseDashKeep
            , parseLeftAngleBracketKeep
            , parseRightAngleBracketKeep
            , parseForwardSlashKeep
            , parseEqualsSignKeep
            , parseWhitespaceKeep
            , parseSingleQuotationMarkKeep
            , parseExclamationMarkKeep
            ]


parseTagAttributeValue : ParseFunction
parseTagAttributeValue =
    flatten <|
        createParseSequenceFunction
            [ parseEqualsSignIgnore
            , createParseAnyFunction
                [ parseDoubleQuotationMarkIgnore
                , parseSingleQuotationMarkIgnore
                ]
            , createOptionallyParseMultipleFunction <|
                createParseAnyFunction
                    [ parseDoubleQuotedString
                    ]
            , createParseAnyFunction
                [ parseDoubleQuotationMarkIgnore
                , parseSingleQuotationMarkIgnore
                ]
            ]


parseTagAttribute : ParseFunction
parseTagAttribute =
    createParseSequenceFunction
        [ parseIgnoreOptionalWhitespace
        , parseWordWithDashes
        , optional parseTagAttributeValue
        , parseIgnoreOptionalWhitespace
        ]


parseTagAttributes : ParseFunction
parseTagAttributes =
    createOptionallyParseMultipleFunction parseTagAttribute


parseOpeningTag : ParseFunction
parseOpeningTag =
    labelled "OPENING_TAG" <|
        createParseSequenceFunction
            [ parseIgnoreOptionalWhitespace
            , parseLeftAngleBracketIgnore
            , parseWordKeep
            , parseIgnoreOptionalWhitespace
            , parseTagAttributes
            , parseIgnoreOptionalWhitespace
            , parseRightAngleBracketIgnore
            , parseIgnoreOptionalWhitespace
            ]


parseClosingTag : ParseFunction
parseClosingTag =
    labelled "CLOSING_TAG" <|
        createParseSequenceFunction
            [ parseIgnoreOptionalWhitespace
            , parseLeftAngleBracketIgnore
            , parseForwardSlashIgnore
            , parseWordKeep
            , parseRightAngleBracketIgnore
            , parseIgnoreOptionalWhitespace
            ]


parseSelfClosingTag : ParseFunction
parseSelfClosingTag =
    labelled "SELF_CLOSING_TAG" <|
        createParseSequenceFunction
            [ parseLeftAngleBracketIgnore
            , parseWordKeep
            , parseIgnoreOptionalWhitespace
            , parseTagAttributes
            , parseIgnoreOptionalWhitespace
            , parseForwardSlashIgnore
            , parseRightAngleBracketIgnore
            ]


parseTextNode : ParseFunction
parseTextNode =
    labelled "TEXT" <|
        createParseAtLeastOneFunction <|
            createParseAnyFunction
                [ parseWordKeep
                , parseWhitespaceKeep
                , parseDashKeep
                , parseEqualsSignKeep
                , parseDoubleQuotationMarkKeep
                , parseSingleQuotationMarkKeep
                , parseForwardSlashKeep
                , parseDashKeep
                , parseRightAngleBracketKeep
                ]


parseOpeningCommentIgnore =
    createParseTokenIgnoreFunction OpeningComment


parseClosingCommentIgnore =
    createParseTokenIgnoreFunction ClosingComment


parseComment : ParseFunction
parseComment =
    ignore <|
        createParseSequenceFunction
            [ createParseTokenIgnoreFunction OpeningComment
            , parseTextNode
            , createParseTokenIgnoreFunction ClosingComment
            ]


parseHtmlTokens : ParseFunction
parseHtmlTokens =
    createParseAtLeastOneFunction <|
        createParseAnyFunction
            [ parseOpeningTag
            , parseTextNode
            , parseClosingTag
            , parseSelfClosingTag
            , parseComment
            ]


xhtmlToRawAst : String -> ParseResult
xhtmlToRawAst s =
    let
        ( result, _ ) =
            parseHtmlTokens <| tokenize s
    in
        result



--------------------------------------------------------------------------------
-- TESTS
--------------------------------------------------------------------------------
-- test data -------------------------------------------------------------------


attributeKeyClass : AstNode
attributeKeyClass =
    UnlabelledAstNode <| AstChildren [ UnlabelledAstNode (AstLeaf "class") ]


attributeValueSuccessAwesome : AstNode
attributeValueSuccessAwesome =
    UnlabelledAstNode <|
        AstChildren
            [ UnlabelledAstNode <| AstLeaf "success"
            , UnlabelledAstNode <| AstLeaf " "
            , UnlabelledAstNode <| AstLeaf "awesome"
            ]


attributeSuccessAwesome : AstNode
attributeSuccessAwesome =
    UnlabelledAstNode <|
        AstChildren
            [ attributeKeyClass
            , attributeValueSuccessAwesome
            ]


attributeId1 : AstNode
attributeId1 =
    UnlabelledAstNode <|
        AstChildren
            [ UnlabelledAstNode <|
                AstChildren
                    [ UnlabelledAstNode (AstLeaf "id") ]
            , UnlabelledAstNode <|
                AstChildren
                    [ UnlabelledAstNode (AstLeaf "1") ]
            ]


twoAttributes : AstNode
twoAttributes =
    UnlabelledAstNode <|
        AstChildren
            [ attributeId1
            , attributeSuccessAwesome
            ]


testTextNode : AstNode
testTextNode =
    LabelledAstNode
        { label = "TEXT"
        , value =
            AstChildren <|
                [ UnlabelledAstNode <| AstLeaf "one"
                , UnlabelledAstNode <| AstLeaf " "
                , UnlabelledAstNode <| AstLeaf "two"
                ]
        }


testClosingTagNode : AstNode
testClosingTagNode =
    LabelledAstNode <|
        { label = "CLOSING_TAG"
        , value = AstChildren [ UnlabelledAstNode <| AstLeaf "div" ]
        }


testOpeningTagNode : AstNode
testOpeningTagNode =
    LabelledAstNode <|
        { label = "OPENING_TAG"
        , value =
            AstChildren
                [ UnlabelledAstNode <| AstLeaf "div"
                , twoAttributes
                ]
        }


testSelfClosingTagNode : AstNode
testSelfClosingTagNode =
    LabelledAstNode <|
        { label = "SELF_CLOSING_TAG"
        , value =
            AstChildren
                [ UnlabelledAstNode <| AstLeaf "img"
                , twoAttributes
                ]
        }



-- tests -----------------------------------------------------------------------


tests =
    suite "HtmlParser.elm"
        [ test "parseTagAttribute"
            (assertEqual
                ( ParseMatchesReturnsResult <|
                    UnlabelledAstNode <|
                        AstChildren
                            [ UnlabelledAstNode <|
                                AstChildren
                                    [ UnlabelledAstNode <| AstLeaf "class" ]
                            , UnlabelledAstNode <|
                                AstChildren
                                    [ UnlabelledAstNode <| AstLeaf "success"
                                    , UnlabelledAstNode <| AstLeaf " "
                                    , UnlabelledAstNode <| AstLeaf "awesome"
                                    ]
                            ]
                , []
                )
                (parseTagAttribute
                    (tokenize """ class="success awesome" """)
                )
            )
        , test "parseTagAttribute with single quote in value"
            (assertEqual
                ( ParseMatchesReturnsResult <|
                    UnlabelledAstNode <|
                        AstChildren
                            [ UnlabelledAstNode <|
                                AstChildren
                                    [ UnlabelledAstNode <| AstLeaf "placeholder" ]
                            , UnlabelledAstNode <|
                                AstChildren
                                    [ UnlabelledAstNode <| AstLeaf "It"
                                    , UnlabelledAstNode <| AstLeaf "'"
                                    , UnlabelledAstNode <| AstLeaf "s"
                                    , UnlabelledAstNode <| AstLeaf " "
                                    , UnlabelledAstNode <| AstLeaf "great"
                                    ]
                            ]
                , []
                )
                (parseTagAttribute
                    (tokenize """ placeholder="It's great" """)
                )
            )
        , test "parse boolean attribute"
            (assertEqual
                ( ParseMatchesReturnsResult <|
                    UnlabelledAstNode <|
                        AstChildren
                            [ UnlabelledAstNode <|
                                AstChildren
                                    [ UnlabelledAstNode <| AstLeaf "disabled" ]
                            ]
                , []
                )
                (parseTagAttribute
                    (tokenize """ disabled """)
                )
            )
        , test "parseMultipleAttributes"
            (assertEqual
                ( ParseMatchesReturnsResult <|
                    UnlabelledAstNode <|
                        AstChildren
                            [ attributeId1
                            , attributeSuccessAwesome
                            ]
                , []
                )
                (parseTagAttributes
                    (tokenize
                        """ id="1" class="success awesome" """
                    )
                )
            )
        , test "parsedDashedAttribute"
            (assertEqual
                ( ParseMatchesReturnsResult <|
                    UnlabelledAstNode <|
                        AstChildren
                            [ UnlabelledAstNode <|
                                AstChildren
                                    [ UnlabelledAstNode <|
                                        AstChildren
                                            [ UnlabelledAstNode <| AstLeaf "data"
                                            , UnlabelledAstNode <| AstLeaf "-"
                                            , UnlabelledAstNode <| AstLeaf "name"
                                            ]
                                    , UnlabelledAstNode <|
                                        AstChildren
                                            [ UnlabelledAstNode <| AstLeaf "elm" ]
                                    ]
                            ]
                , []
                )
                (parseTagAttributes (tokenize """ data-name="elm" """))
            )
        , test "parseClosingTag"
            (assertEqual
                ( ParseMatchesReturnsResult <| testClosingTagNode
                , []
                )
                (parseClosingTag (tokenize "</div>"))
            )
        , test "parseOpeningTag no attributes"
            (assertEqual
                ( ParseMatchesReturnsResult <|
                    LabelledAstNode
                        { label = "OPENING_TAG"
                        , value =
                            AstChildren
                                [ UnlabelledAstNode <| AstLeaf "div"
                                , UnlabelledAstNode <| AstChildren []
                                ]
                        }
                , []
                )
                (parseOpeningTag
                    (tokenize """<div >""")
                )
            )
        , test "parseOpeningTag one attribute"
            (assertEqual
                ( ParseMatchesReturnsResult testOpeningTagNode
                , []
                )
                (parseOpeningTag
                    (tokenize """<div id="1" class="success awesome">""")
                )
            )
        , test "parseSelfClosingTag"
            (assertEqual
                ( ParseMatchesReturnsResult <| testSelfClosingTagNode
                , []
                )
                (parseSelfClosingTag
                    (tokenize """<img id="1" class="success awesome" />""")
                )
            )
        , test "parseTextNode"
            (assertEqual
                ( ParseMatchesReturnsResult <| testTextNode
                , []
                )
                (parseTextNode (tokenize "one two"))
            )
        , test "parseTextNode"
            (assertEqual
                ( ParseDoesNotMatch
                , [ ( LeftAngleBracket, "<" ) ]
                )
                (parseTextNode (tokenize "<"))
            )
        , test "parseTextNode"
            (assertEqual
                ( ParseMatchesReturnsResult <|
                    LabelledAstNode
                        { label = "TEXT"
                        , value =
                            AstChildren
                                [ UnlabelledAstNode <| AstLeaf " "
                                ]
                        }
                , [ ( LeftAngleBracket, "<" ) ]
                )
                (parseTextNode [ ( Whitespace, " " ), ( LeftAngleBracket, "<" ) ])
            )
        , test "parseHtmlTokens"
            (assertEqual
                ( ParseMatchesReturnsResult <|
                    UnlabelledAstNode <|
                        AstChildren
                            [ testOpeningTagNode
                            , testTextNode
                            , testClosingTagNode
                            , testClosingTagNode
                            , testTextNode
                            , testOpeningTagNode
                            ]
                , []
                )
                (parseHtmlTokens
                    (tokenize
                        """ <div id="1" class="success awesome" >one two</div></div>one two<div id="1" class="success awesome" > """
                    )
                )
            )
        , test "parseComment"
            (assertEqual
                ( ParseMatchesReturnsNothing, [] )
                (parseComment (tokenize """<!--hello world-->"""))
            )
        , test "parse empty string"
            (assertEqual
                ( ParseDoesNotMatch, [] )
                (parseHtmlTokens (tokenize ""))
            )
        ]


main =
    runSuiteHtml tests
