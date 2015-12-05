module HtmlToElmWebsite.Layout where

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

mainPanel (windowWidth, windowHeight) =
    let
        width = windowWidth // 2
        height = windowHeight - topBarHeight
    in
        [ ("width", (toString width) ++ "px")
        , ("height", (toString height) ++ "px")
        , ("position", "absolute")
        , ("display", "fixed")
        ]

panelHeader =
    [("height", (toString panelHeaderHeight) ++ "px")]

panelContent (_, windowHeight) =
    let
        height = windowHeight - (topBarHeight + (panelHeaderHeight * 2) )
    in
        [("height", (toString height) ++ "px")]


leftPanel windowDimensions =
    mainPanel windowDimensions ++ [("left", "0px")]

rightPanel windowDimensions =
    mainPanel windowDimensions ++ [("right", "0px")]
