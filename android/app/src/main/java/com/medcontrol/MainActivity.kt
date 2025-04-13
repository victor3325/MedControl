package com.medcontrol

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
// import com.onesignal.OneSignal // Descomente se estiver utilizando OneSignal para notificações
import com.medcontrol.services.NotificationService // Seu serviço personalizado

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "MedControl"

    // Para usar a arquitetura nova, no caso do React 18 com Fabric, você deve garantir que o fabricEnabled está ativado.
    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Configuração para notificações locais, como React Native Push Notification ou seu serviço personalizado
        // Se estiver utilizando OneSignal para notificações push
        // OneSignal.setAppId("YOUR_ONESIGNAL_APP_ID")

        // Se estiver utilizando um serviço personalizado para notificações
    }
}
