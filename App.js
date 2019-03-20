import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ImageBackground
} from "react-native";
import {
  GiftedChat,
  SystemMessage,
  Bubble,
  Avatar,
  Message
} from "react-native-gifted-chat";
import * as Animatable from "react-native-animatable";
import MESSAGES from "./chat";
import { createStackNavigator, createAppContainer } from "react-navigation";
import MessageVideo from "./MessageVideo";

class HomeScreen extends React.Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center"
        }}
      >
        <ImageBackground
          source={require("./assets/background.jpg")}
          style={{
            width: "100%",
            height: "100%"
          }}
          resizeMode={"cover"}
        >
          <View
            style={{
              marginTop: 20
            }}
          >
            <TouchableOpacity
              onPress={() => this.props.navigation.push("Chat")}
            >
              <View
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  marginTop: 24,
                  marginBottom: 8,
                  padding: 8,
                  width: "100%"
                }}
              >
                <Text
                  style={{
                    fontSize: 25,
                    marginBottom: 12,
                    fontWeight: "500",
                    color: "white",
                    ...Platform.select({
                      ios: { fontFamily: "Avenir Next" },
                      android: { fontFamily: "Roboto" }
                    }),
                    fontStyle: "normal",
                    textAlign: "center"
                  }}
                >
                  De la Syrie à l’Allemagne, carnet de route d’un exil
                </Text>

                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "400",
                    color: "white",
                    fontStyle: "normal",
                    textAlign: "center",
                    marginBottom: 10
                  }}
                >
                  Dans le téléphone d’une migrante syrienne
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  marginTop: 80,
                  padding: 16,
                  width: "100%"
                }}
              >
                <Text style={{ color: "white" }}>
                  Dash et Kholio ont quitté Damas samedi 19 septembre. Direction
                  l'Europe. Kholio laisse derrière lui sa femme, Mimoty, qui est
                  également la petite sœur de Dash. Cette odyssée, ils lui en
                  feront partager minute par minute les doutes et les avancées,
                  avec le service de messagerie WhatsApp.{"\n\n"}Un journal de
                  bord également suivi par la mère de Dash, Mön, sa grande sœur,
                  « Lou£ou », et des amis, notamment Khaled (« 5aled »), Nawar,
                  Haya et Alia. L’objectif : atteindre l’Allemagne et y
                  retrouver Nash, le frère de Dash.
                </Text>

                <Animatable.Text
                  animation={"pulse"}
                  iterationCount={"infinite"}
                  style={{
                    color: "white",
                    fontWeight: "600",
                    textAlign: "center"
                  }}
                >
                  {"\n"}Touchez pour découvir leur histoire
                </Animatable.Text>
              </View>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

class EndScreen extends React.Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center"
        }}
      >
        <ImageBackground
          source={require("./assets/background.jpg")}
          style={{
            width: "100%",
            height: "100%"
          }}
          resizeMode={"cover"}
        >
          <View
            style={{
              marginTop: 20
            }}
          >
            <View
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                marginTop: 24,
                marginBottom: 8,
                padding: 8,
                width: "100%"
              }}
            >
              <Text
                style={{
                  fontSize: 25,
                  fontWeight: "500",
                  color: "white",
                  ...Platform.select({
                    ios: { fontFamily: "Avenir Next" },
                    android: { fontFamily: "Roboto" }
                  }),
                  fontStyle: "normal",
                  textAlign: "center"
                }}
              >
                ... et depuis ?
              </Text>
            </View>

            <View
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                marginTop: 60,
                padding: 16,
                width: "100%"
              }}
            >
              <Text style={{ color: "white" }}>
                “Comment je me sens ? En sécurité. Heureuse d’être ici parce que
                j’ai une chance de pouvoir faire quelque chose de ma vie. Mais
                je me sens seule parfois. L’Allemagne est un pays merveilleux
                mais on a aussi eu beaucoup de mauvais moments depuis notre
                arrivée. Après être passés par un camp horrible à Heidelberg
                puis par Mannheim - J’ai détesté cette ville - et Göppingen,
                nous sommes à Bad Boll aujourd’hui.{"\n\n"}
                Ici, certains ne voulaient pas de réfugiés. En même temps, les
                gens nous aident beaucoup. Hier, quelqu’un m’a même apporté de
                l’argile pour que je puisse sculpter. C’est un village très
                calme. Plutôt ennuyeux même. Il n’y a même pas de cours pour
                apprendre l’allemand.{"\n\n"}
                Lundi, on doit recevoir notre autorisation pour avoir le droit
                de rester trois mois, le temps d’obtenir celle pour rester trois
                ans. Mais je viens d’apprendre que ma grande soeur, Loulou, va
                se lancer dans le voyage. La semaine prochaine. Le même que nous
                pour arriver ici.”
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

class Chat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      started: false
    };

    this.next = this.next.bind(this);
    this.renderMessageVideo = this.renderMessageVideo.bind(this);
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages)
    }));
  }

  next() {
    if (this.state.messages.length + 1 > MESSAGES.length) {
      this.props.navigation.push("EndScreen");
    } else {
      this.onSend([MESSAGES[this.state.messages.length]]);
    }
  }

  renderMessageVideo(props) {
    if (props.currentMessage.video) {
      const { containerStyle, wrapperStyle, ...messageVideoProps } = props;

      return <MessageVideo {...messageVideoProps} />;
    }

    return null;
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <GiftedChat
          messages={this.state.messages}
          user={{
            _id: 15
          }}
          renderUsernameOnMessage={true}
          renderSend={props => {
            return <View />;
          }}
          renderInputToolbar={props => {
            return (
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onPress={this.next}
              >
                <Text>Touchez ici pour faire défiler les messages</Text>
              </TouchableOpacity>
            );
          }}
          renderAvatar={props => {
            return (
              <Animatable.View animation={"slideInUp"} duration={300}>
                <Avatar {...props} />
              </Animatable.View>
            );
          }}
          renderBubble={props => {
            return (
              <Animatable.View animation={"slideInUp"} duration={300}>
                <Bubble
                  {...props}
                  wrapperStyle={{
                    left: {
                      backgroundColor: "#f0f0f0"
                    }
                  }}
                  renderMessageVideo={this.renderMessageVideo}
                />
              </Animatable.View>
            );
          }}
          renderSystemMessage={props => {
            return (
              <Animatable.View animation={"slideInUp"} duration={300}>
                <SystemMessage
                  {...props}
                  textStyle={{
                    fontSize: 15,
                    textAlign: "center"
                  }}
                >
                  {props.currentMessage}
                </SystemMessage>
              </Animatable.View>
            );
          }}
        />
      </SafeAreaView>
    );
  }
}

const AppNavigator = createStackNavigator(
  {
    Home: {
      screen: HomeScreen
    },
    Chat: {
      screen: Chat
    },
    EndScreen: {
      screen: EndScreen
    }
  },
  { headerMode: "none" }
);

export default createAppContainer(AppNavigator);
