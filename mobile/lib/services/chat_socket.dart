import 'dart:async';
import 'dart:convert';

import 'package:web_socket_channel/web_socket_channel.dart';

import '../config/api_config.dart';
import 'token_storage.dart';

/// Live chat notifications only. Messages are still sent via REST.
class ChatSocket {
  ChatSocket._();

  static final ChatSocket instance = ChatSocket._();

  final TokenStorage _tokens = TokenStorage.instance;
  final StreamController<Map<String, dynamic>> _events =
      StreamController<Map<String, dynamic>>.broadcast();

  WebSocketChannel? _channel;
  StreamSubscription? _subscription;
  Timer? _pingTimer;
  Timer? _reconnectTimer;
  bool _connecting = false;
  bool _disposed = false;
  bool _shouldRun = false;
  int _reconnectAttempt = 0;

  Stream<Map<String, dynamic>> get events => _events.stream;

  bool get isConnected => _channel != null;

  Future<void> connect() async {
    _shouldRun = true;
    _disposed = false;
    await _open();
  }

  Future<void> disconnect() async {
    _shouldRun = false;
    _reconnectTimer?.cancel();
    _reconnectTimer = null;
    await _closeChannel();
  }

  Future<void> _open() async {
    if (!_shouldRun || _connecting) return;
    _connecting = true;
    try {
      await _closeChannel();
      final token = await _tokens.accessToken;
      if (token == null || token.isEmpty || !_shouldRun) return;

      final uri = Uri.parse(
        '${ApiConfig.wsV1}/ws/chat?token=${Uri.encodeQueryComponent(token)}',
      );
      final channel = WebSocketChannel.connect(uri);
      _channel = channel;
      _reconnectAttempt = 0;

      _subscription = channel.stream.listen(
        _onData,
        onError: (_) => _scheduleReconnect(),
        onDone: _scheduleReconnect,
        cancelOnError: true,
      );

      _pingTimer?.cancel();
      _pingTimer = Timer.periodic(const Duration(seconds: 25), (_) {
        _send({'type': 'ping'});
      });
    } catch (_) {
      _scheduleReconnect();
    } finally {
      _connecting = false;
    }
  }

  void _onData(dynamic raw) {
    try {
      final decoded = raw is String ? jsonDecode(raw) : raw;
      if (decoded is! Map) return;
      final event = Map<String, dynamic>.from(decoded);
      final type = event['type']?.toString();
      if (type == 'pong') return;
      if (!_events.isClosed) {
        _events.add(event);
      }
    } catch (_) {
      // Ignore malformed frames.
    }
  }

  void _send(Map<String, dynamic> payload) {
    final channel = _channel;
    if (channel == null) return;
    try {
      channel.sink.add(jsonEncode(payload));
    } catch (_) {
      _scheduleReconnect();
    }
  }

  void _scheduleReconnect() {
    if (!_shouldRun || _disposed) return;
    _pingTimer?.cancel();
    _pingTimer = null;
    _channel = null;
    _reconnectTimer?.cancel();
    final delaySeconds = (1 << _reconnectAttempt.clamp(0, 5)).clamp(1, 30);
    _reconnectAttempt += 1;
    _reconnectTimer = Timer(Duration(seconds: delaySeconds), () {
      if (_shouldRun) {
        unawaited(_open());
      }
    });
  }

  Future<void> _closeChannel() async {
    _pingTimer?.cancel();
    _pingTimer = null;
    await _subscription?.cancel();
    _subscription = null;
    try {
      await _channel?.sink.close();
    } catch (_) {}
    _channel = null;
  }
}
