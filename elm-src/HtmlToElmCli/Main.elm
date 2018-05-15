port module Main exposing (..)

{-| The compiler have don't add the Json.Decode by default to serialize the ports Output.
-}

import HtmlToElm.HtmlToElm exposing (htmlToElm)
import Json.Decode
import Process
import Task
import Time exposing (Time)


main : Program Never Model Msg
main =
    Platform.program
        { init = init
        , update = update
        , subscriptions = subscriptions
        }


type alias Model =
    { html : String
    , elmCode : Maybe String
    , indentSpaces : Int
    , currentSnippet : String
    }


type Msg
    = Stop
    | Abort
    | HtmlInput String


init : ( Model, Cmd Msg )
init =
    ( { html = ""
      , elmCode = Just ""
      , indentSpaces = 4
      , currentSnippet = ""
      }
    , delayMsg 3000 <| Stop
    )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Stop ->
            model ! [ exitApp 0 ]

        Abort ->
            model ! [ exitApp -1 ]

        HtmlInput html ->
            let
                elmCode =
                    htmlToElm model.indentSpaces html
            in
            ( { model
                | html = html
                , elmCode = elmCode
              }
            , Cmd.batch [ outgoingElmCode elmCode ]
            )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ externalStop <| always Abort
        , incomingHtmlCode HtmlInput
        ]


{-| Ports to communicate the elm app with the CLI
-}
port exitApp : Float -> Cmd msg


port externalStop : (() -> msg) -> Sub msg


port incomingHtmlCode : (String -> msg) -> Sub msg


port outgoingElmCode : Maybe String -> Cmd msg



-- UTILITIES


delayMsg : Time -> Msg -> Cmd Msg
delayMsg time msg =
    Process.sleep time
        |> Task.perform (\_ -> msg)
