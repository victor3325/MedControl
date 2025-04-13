package com.medcontrol.services

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build

object NotificationService {
    private const val CHANNEL_ID = "medcontrol_reminders"
    private const val CHANNEL_NAME = "Lembretes de Medicação"
    private const val CHANNEL_DESC = "Notificações para lembrar de tomar os remédios"

    fun createNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(CHANNEL_ID, CHANNEL_NAME, importance).apply {
                description = CHANNEL_DESC
            }

            val notificationManager: NotificationManager =
                context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    fun getChannelId(): String = CHANNEL_ID
}
