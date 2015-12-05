module Main where

import Dict
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Window
import Debug exposing (..)
import HtmlToElmWebsite.Layout as Layout
import HtmlToElmWebsite.HtmlComponents exposing (githubStarButton)
import HtmlToElmWebsite.HtmlExamples exposing (htmlExamples)
import HtmlToElm.HtmlToElm exposing (htmlToElm)

type alias StringAddress = Signal.Address String


currHtmlMailbox : Signal.Mailbox String
currHtmlMailbox =
  Signal.mailbox ""


topBar : Html
topBar =
    div [ class "top-bar", style Layout.topBar ]
        [ div
            []
            [ p
                [ style [("float", "left")]]
                [ text "HTML to Elm" ]
            , div
                [ style [("float", "right"), ("font-size", "14px")]]
                [ a
                    [ href "https://github.com/mbylstra/html-to-elm"
                    , style [("margin-right", "10px")]
                    ]
                    [ img
                        [ src "https://cdn0.iconfinder.com/data/icons/octicons/1024/mark-github-16.png"
                        , style [("vertical-align", "text-top")]
                        ]
                        []
                    , text " https://github.com/mbylstra/html-to-elm"
                    ]
                , githubStarButton
                    { user="mbylstra"
                    , repo="html-to-elm"
                    , type'="star"
                    , size="small"
                    , style=[("vertical-align", "middle"), ("margin-top", "-5px")]
                    }
                ]
            ]
        ]


snippetButton : String -> Signal.Address Action -> Html
snippetButton snippetName address =
    span
        [class "example-button"
        , onClick address (LoadSnippet snippetName)
        ]
        [ text snippetName ]


snippetButtons : Signal.Address Action -> List Html
snippetButtons address =
    List.map (\key -> snippetButton key address) (Dict.keys htmlExamples)


leftPanel : ( Int, Int ) -> Signal.Address Action -> Html
leftPanel windowDimensions address =
    div
        [ class "left-panel", style <| Layout.leftPanel windowDimensions ]
        [ div
            [ style Layout.panelHeader
            , class "left-panel-heading"
            ]
            [ text "Type or paste HTML here" ]
        , div
            []
            [ textarea
                [ type' "string"
                , id "html"
                , placeholder "input"
                , name "points"
                , on "input" targetValue (\v -> Signal.message currHtmlMailbox.address v)  -- this should be an action!
                ]
                [ ]
            ]
        , div
            [ style Layout.panelHeader
            , class "left-panel-heading"
            ]
            ([ text "snippets: " ]  ++  snippetButtons address)
        ]


copyButton : Bool -> Html
copyButton visible =
    let
        style' = if visible then [] else [("display", "none")]
    in
        div
          [ id "copy-button",  style style', class "copy-button" ]
          [ text "copy"]


rightPanel : ( Int, Int ) -> Model -> Signal.Address Action -> Html
rightPanel windowDimensions model address =

    let
        hint =
            case model.elmCode of
                Just elmCode ->
                    div [] []
                Nothing ->
                    div [ class "hint" ]
                        [ text """
                            Hint: only one top level element is allowed
                          """
                        ]

    in
        div
            [ class "right-panel", style <| Layout.rightPanel windowDimensions]
            [ div
                [ style Layout.panelHeader
                , class "right-panel-heading"
                ]
                [ text "Elm code appears here (see "
                , a [href "https://github.com/evancz/elm-html", target "_blank"] [ text "elm-html"]
                , text ")"
                ]
            , div
                [ style <| Layout.panelContent windowDimensions
                , class "elm-code"
                ]
                [ hint
                , pre [id "elm-code", class "elm"] []
                ]
            , div
                [ style Layout.panelHeader
                , class "right-panel-heading"
                ]
                [ text "indent spaces: "
                , span
                    [ class "example-button"
                    , onClick address (SetIndentSpaces 2)
                    ]
                    [text "2"]
                , span
                    [class "example-button"
                    , onClick address (SetIndentSpaces 4)
                    ]
                    [text "4"]
                ]
              --, copyButton (if elmCode == "" then True else True)
            , copyButton True
            ]

type Action =
    LoadSnippet String
    | SetIndentSpaces Int
    | HtmlUpdated String


actionsMailbox : Signal.Mailbox (Maybe Action)
actionsMailbox = Signal.mailbox Nothing


actionsAddress : Signal.Address Action
actionsAddress =
  Signal.forwardTo actionsMailbox.address Just


updateFunc : Maybe Action -> Model   ->   Model
updateFunc maybeAction model =
    case maybeAction of
        Just action ->
            case action of
                HtmlUpdated html ->
                    { model |
                      html = html
                    , elmCode = (htmlToElm 4) html
                    }
                LoadSnippet snippetName ->
                    { model |
                      currentSnippet =
                          case (Dict.get snippetName htmlExamples) of
                              Just snippet -> snippet
                              Nothing -> ""
                    }
                SetIndentSpaces indentSpaces ->
                    { model |
                      indentSpaces = indentSpaces
                    }
        Nothing ->
            Debug.crash "This should never happen."


type alias Model =
    { html : String
    , elmCode: Maybe String
    , indentSpaces : Int
    , currentSnippet : String
    }


initialModel : Model
initialModel =
    { html = ""
    , elmCode = Just ""
    , indentSpaces = 4
    , currentSnippet = ""
    }


actionsModelSignal : Signal Model
actionsModelSignal =
    Signal.foldp updateFunc initialModel actionsMailbox.signal


modelSignal : Signal Model
modelSignal =
    let
        reducer actionsModel htmlCode =
            let
                elmCode = htmlToElm actionsModel.indentSpaces htmlCode
            in
                { actionsModel |
                  elmCode = elmCode
                }
    in
        Signal.map2 reducer actionsModelSignal incomingHtmlCodeSignal


main : Signal Html
main =
  Signal.map2 (view actionsAddress) modelSignal Window.dimensions


view : Signal.Address Action -> Model -> (Int, Int)  ->   Html
view actionAddress model windowDimensions =
  div [ ]
    [ topBar
    , div []
        [ leftPanel windowDimensions actionAddress
        , rightPanel windowDimensions model actionAddress
        ]
    ]


port incomingHtmlCodeSignal : Signal (String)

port outgoingElmCode : Signal (Maybe String)
port outgoingElmCode = Signal.map .elmCode modelSignal

port windowHeight : Signal Int
port windowHeight = Window.height

port currentSnippet : Signal String
port currentSnippet = Signal.dropRepeats (Signal.map .currentSnippet modelSignal)
