import * as React from "react"
import { useFocusEffect } from "@react-navigation/native"
import { Alert, Image, View } from "react-native"
import { Button } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { useApolloClient } from "@apollo/client"

import { Screen } from "../../components/screen"
import { color } from "../../theme"
import { palette } from "../../theme/palette"
import { translate } from "../../i18n"
import KeyStoreWrapper from "../../utils/storage/secureStorage"
import BiometricWrapper from "../../utils/biometricAuthentication"
import { resetDataStore } from "../../utils/logout"
import type { ScreenType } from "../../types/screen"
import { AuthenticationScreenPurpose, PinScreenPurpose } from "../../utils/enum"
import { checkClipboard } from "../../utils/clipboard"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const BitcoinBeachLogo = require("../get-started-screen/bitcoinBeach3.png")

const styles = EStyleSheet.create({
  Logo: {
    marginTop: 24,
    maxHeight: "50%",
    maxWidth: "50%",
  },

  bottom: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 36,
    width: "100%",
  },

  button: {
    backgroundColor: palette.white,
    borderRadius: 24,
  },

  buttonAlternate: {
    backgroundColor: palette.lightBlue,
    borderRadius: 24,
  },

  buttonAlternateTitle: {
    color: palette.white,
  },

  buttonContainer: {
    marginVertical: 12,
    width: "80%",
  },

  buttonTitle: {
    color: color.primary,
    fontWeight: "bold",
  },

  container: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
})

type Props = {
  route: {
    params: {
      screenPurpose: AuthenticationScreenPurpose
      isPinEnabled: boolean
    }
  }
  navigation: any
}

export const AuthenticationScreen: ScreenType = ({ route, navigation }: Props) => {
  const client = useApolloClient()

  const { screenPurpose, isPinEnabled } = route.params

  useFocusEffect(() => {
    attemptAuthentication()
  })

  const attemptAuthentication = () => {
    let description
    if (screenPurpose === AuthenticationScreenPurpose.Authenticate) {
      description = translate("AuthenticationScreen.authenticationDescription")
    } else if (screenPurpose === AuthenticationScreenPurpose.TurnOnAuthentication) {
      description = translate("AuthenticationScreen.setUpAuthenticationDescription")
    }
    // Presents the OS specific authentication prompt
    BiometricWrapper.authenticate(
      description,
      handleAuthenticationSuccess,
      handleAuthenticationFailure,
    )
  }

  const handleAuthenticationSuccess = () => {
    if (screenPurpose === AuthenticationScreenPurpose.Authenticate) {
      KeyStoreWrapper.resetPinAttempts()
      navigation.replace("Primary")
      checkClipboard(client)
    } else if (screenPurpose === AuthenticationScreenPurpose.TurnOnAuthentication) {
      KeyStoreWrapper.setIsBiometricsEnabled()
    }
  }

  const handleAuthenticationFailure = () => {
    // This is called when a user cancels or taps out of the authentication prompt,
    // so no action is necessary.
  }

  const logout = async () => {
    await resetDataStore(client)
    Alert.alert(translate("common.loggedOut"), "", [
      {
        text: translate("common.ok"),
        onPress: () => {
          navigation.replace("Primary")
        },
      },
    ])
  }

  let pinButtonContent
  let alternateContent

  if (isPinEnabled) {
    pinButtonContent = (
      <Button
        title={translate("AuthenticationScreen.usePin")}
        buttonStyle={styles.buttonAlternate}
        titleStyle={styles.buttonAlternateTitle}
        onPress={() =>
          navigation.navigate("pin", { screenPurpose: PinScreenPurpose.AuthenticatePin })
        }
        containerStyle={styles.buttonContainer}
      />
    )
  } else {
    pinButtonContent = null
  }

  if (screenPurpose === AuthenticationScreenPurpose.Authenticate) {
    alternateContent = (
      <>
        {pinButtonContent}
        <Button
          title={translate("common.logout")}
          buttonStyle={styles.buttonAlternate}
          titleStyle={styles.buttonAlternateTitle}
          onPress={() => logout()}
          containerStyle={styles.buttonContainer}
        />
      </>
    )
  } else if (screenPurpose === AuthenticationScreenPurpose.TurnOnAuthentication) {
    alternateContent = (
      <Button
        title={translate("AuthenticationScreen.skip")}
        buttonStyle={styles.buttonAlternate}
        titleStyle={styles.buttonAlternateTitle}
        onPress={() => navigation.replace("Primary")}
        containerStyle={styles.buttonContainer}
      />
    )
  } else {
    alternateContent = null
  }

  return (
    <Screen
      style={styles.container}
      backgroundColor={palette.lightBlue}
      statusBar="light-content"
    >
      <Image style={styles.Logo} source={BitcoinBeachLogo} resizeMode="contain" />
      <View style={styles.bottom}>
        <Button
          title={(() => {
            if (screenPurpose === AuthenticationScreenPurpose.Authenticate) {
              return translate("AuthenticationScreen.unlock")
            } else if (
              screenPurpose === AuthenticationScreenPurpose.TurnOnAuthentication
            ) {
              return translate("AuthenticationScreen.setUp")
            } else {
              return ""
            }
          })()}
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
          onPress={() => attemptAuthentication()}
          containerStyle={styles.buttonContainer}
        />
        {alternateContent}
      </View>
    </Screen>
  )
}
