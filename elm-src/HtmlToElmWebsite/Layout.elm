module HtmlToElmWebsite.Layout exposing (..)

-- import Window
import Html exposing (Html)

topBarHeight = 50
panelHeaderHeight = 30

topBar =
    [ ("height", (toString topBarHeight) ++ "px")
    , ("line-height", (toString topBarHeight) ++ "px")
    , ("padding-left", (toString 12) ++ "px")
    , ("font-size", (toString 20) ++ "px")
    , ("color", "#293c4b")
    ]

topBarRight =
    [ ("float", "right")
    ]

mainPanel windowSize =
    let
        width = windowSize.width // 2
        height = windowSize.height - topBarHeight
    in
        [ ("width", (toString width) ++ "px")
        , ("height", (toString height) ++ "px")
        , ("position", "absolute")
        , ("display", "fixed")
        ]

panelHeader =
    [("height", (toString panelHeaderHeight) ++ "px")]

panelContent windowSize =
    let
        height = windowSize.height - (topBarHeight + (panelHeaderHeight * 2) )
    in
        [("height", (toString height) ++ "px")]


-- leftPanel : Window.Size -> List (Html msg)
leftPanel windowSize =
    mainPanel windowSize ++ [("left", "0px")]
-- rightPanel : Window.Size -> List (Html msg)
rightPanel windowSize =
    mainPanel windowSize ++ [("right", "0px")]
