import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';

/// Base URL for backend-mobile (port 5001).
///
/// - Android emulator: `10.0.2.2` maps to host machine localhost
/// - iOS simulator / desktop: `localhost`
/// - Physical device: set [deviceHostOverride] to your PC's LAN IP
class ApiConfig {
  static const int port = 5001;

  /// Set to e.g. `192.168.1.42` when testing on a physical phone.
  static const String? deviceHostOverride = null;

  static String get baseUrl {
    if (deviceHostOverride != null && deviceHostOverride!.isNotEmpty) {
      return 'http://$deviceHostOverride:$port';
    }
    if (kIsWeb) {
      return 'http://localhost:$port';
    }
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:$port';
    }
    return 'http://localhost:$port';
  }

  static String get apiV1 => '$baseUrl/api/v1';

  /// WebSocket base for live chat notifications (`ws://.../api/v1`).
  static String get wsV1 {
    if (baseUrl.startsWith('https://')) {
      return 'wss://${baseUrl.substring('https://'.length)}/api/v1';
    }
    if (baseUrl.startsWith('http://')) {
      return 'ws://${baseUrl.substring('http://'.length)}/api/v1';
    }
    return '$baseUrl/api/v1';
  }
}
