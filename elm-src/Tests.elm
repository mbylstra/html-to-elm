import ElmTest.Test exposing (test, suite)
import ElmTest.Assertion exposing (assert, assertEqual)
import ElmTest.Runner.Element exposing (elementRunner)

import Tokenizer
import Parser
import ParserHelpers
import XhtmlParser
import XhtmlParserRawAst

tests = suite "Parser.elm"
    [
        Tokenizer.tests,
        Parser.tests,
        ParserHelpers.tests,
        XhtmlParser.tests,
        XhtmlParserRawAst.tests
    ]

main = elementRunner tests
