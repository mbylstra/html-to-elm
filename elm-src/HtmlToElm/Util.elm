module HtmlToElm.Util (..) where

--------------------------------------------------------------------------------
-- EXTERNAL DEPENDENCIES
--------------------------------------------------------------------------------
import Dict exposing (Dict)
import String
import ElmTest.Test exposing (test, suite)
import ElmTest.Assertion exposing (assert, assertEqual)
import ElmTest.Runner.Element exposing (runDisplay)
import Debug exposing (log)
import Maybe exposing (Maybe)


--------------------------------------------------------------------------------
-- TYPES
--------------------------------------------------------------------------------

type IndentTree = Leaf String | IndentTrees (List IndentTree)


flattenIndentTree : IndentTree -> List String
flattenIndentTree indentTree =
    let
        flattenIndentTree' : IndentTree -> List String   ->   List String
        flattenIndentTree' indentTree acc =
            acc ++ (flattenIndentTree indentTree)
    in
        case indentTree of
            Leaf s -> [s]
            IndentTrees trees ->
                List.foldl flattenIndentTree' [] trees


testIndentTree1 =  (Leaf "a")
testIndentTree2 =  (IndentTrees ([Leaf ("a"), IndentTrees ([Leaf ("b")])]))

tests = suite "HtmlToElm.elm"
    [
        test "flattenIndentTree" (
            assertEqual
                ["a"]
                (flattenIndentTree testIndentTree1)
        )
        ,
        test "flattenIndentTree" (
            assertEqual
                ["a", "b"]
                (flattenIndentTree testIndentTree2)
        )
    ]

main =
    runDisplay tests
