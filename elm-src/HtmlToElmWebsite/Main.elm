port module Main exposing (..)

import Task
import Dict
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Window


-- import Debug exposing (..)

import HtmlToElmWebsite.Layout as Layout
import HtmlToElmWebsite.HtmlComponents exposing (githubStarButton)
import HtmlToElmWebsite.HtmlExamples exposing (htmlExamples)
import HtmlToElm.HtmlToElm exposing (htmlToElm)


-- type alias StringAddress = Signal.Address String
-- currHtmlMailbox : Signal.Mailbox String
-- currHtmlMailbox =
--   Signal.mailbox ""


topBar : Html Msg
topBar =
    div [ class "top-bar", style Layout.topBar ]
        [ div
            []
            [ p
                [ style [ ( "float", "left" ) ] ]
                [ text "HTML to Elm" ]
            , div
                [ style [ ( "float", "right" ), ( "font-size", "14px" ) ] ]
                [ a
                    [ href "https://github.com/mbylstra/html-to-elm"
                    , style [ ( "margin-right", "10px" ) ]
                    ]
                    [ img
                        [ src "https://cdn0.iconfinder.com/data/icons/octicons/1024/mark-github-16.png"
                        , style [ ( "vertical-align", "text-top" ) ]
                        ]
                        []
                    , text " https://github.com/mbylstra/html-to-elm"
                    ]
                , githubStarButton
                    { user = "mbylstra"
                    , repo = "html-to-elm"
                    , type_ = "star"
                    , size = "small"
                    , style = [ ( "vertical-align", "middle" ), ( "margin-top", "-5px" ) ]
                    }
                ]
            ]
        ]


snippetButton : String -> Html Msg
snippetButton snippetName =
    span
        [ class "example-button"
        , onClick (LoadSnippet snippetName)
        ]
        [ text snippetName ]


snippetButtons : List (Html Msg)
snippetButtons =
    List.map (\key -> snippetButton key) (Dict.keys htmlExamples)


leftPanel : Model -> Html Msg
leftPanel model =
    div
        [ class "left-panel", style <| Layout.leftPanel model.windowSize ]
        [ div
            [ style Layout.panelHeader
            , class "left-panel-heading"
            ]
            [ text "Type or paste HTML here" ]
        , div
            []
            [ textarea
                [ -- type_ "string"
                  id "html"
                , placeholder "input"
                , name "points"
                  -- , on "input" targetValue (\v -> Signal.message currHtmlMailbox.address v)  -- this should be an action!
                ]
                []
            ]
        , div
            [ style Layout.panelHeader
            , class "left-panel-heading"
            ]
            ([ text "snippets: " ] ++ snippetButtons)
        ]


copyButton : Bool -> Html Msg
copyButton visible =
    let
        style_ =
            if visible then
                []
            else
                [ ( "display", "none" ) ]
    in
        div
            [ onClick OnClickCopy, id "copy-button", style style_, class "copy-button" ]
            [ text "copy" ]


rightPanel : Model -> Html Msg
rightPanel model =
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
            [ class "right-panel", style <| Layout.rightPanel model.windowSize ]
            [ div
                [ style Layout.panelHeader
                , class "right-panel-heading"
                ]
                [ text "Elm code appears here (see "
                , a [ href "https://github.com/elm-lang/html", target "_blank" ] [ text "elm-lang/html" ]
                , text ")"
                ]
            , div
                [ style <| Layout.panelContent model.windowSize
                , class "elm-code"
                ]
                [ hint
                , pre [ id "elm-code", class "elm" ] []
                ]
            , div
                [ style Layout.panelHeader
                , class "right-panel-heading"
                ]
                [ text "indent spaces: "
                , span
                    [ class "example-button"
                    , onClick (SetIndentSpaces 2)
                    ]
                    [ text "2" ]
                , span
                    [ class "example-button"
                    , onClick (SetIndentSpaces 4)
                    ]
                    [ text "4" ]
                ]
              --, copyButton (if elmCode == "" then True else True)
            , copyButton True
            ]


type Msg
    = LoadSnippet String
    | SetIndentSpaces Int
    | HtmlUpdated String
    | WindowSizeChanged Window.Size
    | ElmDomReady
    | NoOp
    | OnClickCopy



-- actionsMailbox : Signal.Mailbox (Maybe Msg)
-- actionsMailbox = Signal.mailbox Nothing
-- actionsAddress : Signal.Address Msg
-- actionsAddress =
--   Signal.forwardTo actionsMailbox.address Just


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case Debug.log "msg" msg of
        HtmlUpdated html ->
            let
                elmCode =
                    (htmlToElm model.indentSpaces) html
            in
                { model
                    | html = html
                    , elmCode = elmCode
                }
                    ! [ outgoingElmCode elmCode ]

        LoadSnippet snippetName ->
            let
                snippet =
                    case (Dict.get snippetName htmlExamples) of
                        Just snippet_ ->
                            snippet_

                        Nothing ->
                            ""
            in
                { model | currentSnippet = snippet }
                    ! [ currentSnippet snippet ]

        SetIndentSpaces indentSpaces ->
            let
                newModel =
                    { model | indentSpaces = indentSpaces }
            in
                newModel
                    ! [ Task.perform identity (Task.succeed (HtmlUpdated model.html)) ]

        WindowSizeChanged size ->
            { model | windowSize = size } ! []

        ElmDomReady ->
            model
                ! [ elmDomReady "" ]

        NoOp ->
            model ! []

        OnClickCopy ->
            ( model, copyCode () )



-- Nothing ->
--     Debug.crash "This should never happen."


type alias Model =
    { html : String
    , elmCode : Maybe String
    , indentSpaces : Int
    , currentSnippet : String
    , windowSize : Window.Size
    }


initialModel : Model
initialModel =
    { html = ""
    , elmCode = Just ""
    , indentSpaces = 4
    , currentSnippet = ""
    , windowSize = { width = 1000, height = 20 }
    }



-- actionsModelSignal : Signal Model
-- actionsModelSignal =
--     Signal.foldp updateFunc initialModel actionsMailbox.signal
-- modelSignal : Signal Model
-- modelSignal =
--     let
--         reducer actionsModel htmlCode =
--             let
--                 elmCode = htmlToElm actionsModel.indentSpaces htmlCode
--             in
--                 { actionsModel |
--                   elmCode = elmCode
--                 }
--     in
--         Signal.map2 reducer actionsModelSignal incomingHtmlCodeSignal
-- main : Signal Html
-- main =
--   Signal.map2 (view actionsAddress) modelSignal Window.dimensions


view : Model -> Html Msg
view model =
    div []
        [ topBar
        , div []
            [ leftPanel model
            , rightPanel model
            ]
        ]



-- port incomingHtmlCodeSignal : Signal (String)
-- port outgoingElmCode : Signal (Maybe String)
-- port outgoingElmCode = Signal.map .elmCode modelSignal
-- port windowHeight : Signal Int
-- port windowHeight = Window.height


main : Program Never Model Msg
main =
    Html.program
        { init =
            initialModel
                ! [ Task.perform (\size -> WindowSizeChanged size) Window.size
                  , Task.perform identity (Task.succeed ElmDomReady)
                  ]
        , update = update
        , view = view
        , subscriptions = subscriptions
        }


subscriptions : Model -> Sub Msg
subscriptions model =
    -- suggestions Suggest
    incomingHtmlCode HtmlUpdated



-- subscriptions model =
--   Window.resizes (\size -> WindowSizeChanged size)


port incomingHtmlCode : (String -> msg) -> Sub msg



-- port suggestions : (List String -> msg) -> Sub msg


port outgoingElmCode : Maybe String -> Cmd msg


port currentSnippet : String -> Cmd msg


port elmDomReady : String -> Cmd msg


port copyCode : () -> Cmd msg
