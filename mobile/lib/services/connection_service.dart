import '../models/connection_request.dart';
import 'api_client.dart';

class ConnectionService {
  ConnectionService({ApiClient? apiClient})
    : _api = apiClient ?? ApiClient.instance;

  final ApiClient _api;

  Future<Map<String, dynamic>> sendRequest(String targetUserId) async {
    try {
      return await _api.post(
        '/connections/request/$targetUserId',
        authenticated: true,
      );
    } on ApiException catch (e) {
      throw ConnectionException(e.message);
    }
  }

  Future<void> passProfile(String targetUserId) async {
    try {
      await _api.post(
        '/users/discover/$targetUserId/pass',
        authenticated: true,
      );
    } on ApiException catch (e) {
      throw ConnectionException(e.message);
    }
  }

  Future<void> acceptRequest(String requestId) async {
    try {
      await _api.put(
        '/connections/request/$requestId/accept',
        authenticated: true,
      );
    } on ApiException catch (e) {
      throw ConnectionException(e.message);
    }
  }

  Future<void> declineRequest(String requestId) async {
    try {
      await _api.put(
        '/connections/request/$requestId/decline',
        authenticated: true,
      );
    } on ApiException catch (e) {
      throw ConnectionException(e.message);
    }
  }

  Future<List<ConnectionRequestItem>> fetchReceivedRequests() async {
    try {
      final rows = await _api.getList(
        '/connections/requests/received',
        authenticated: true,
      );
      return rows.map(ConnectionRequestItem.fromJson).toList();
    } on ApiException catch (e) {
      throw ConnectionException(e.message);
    }
  }

  Future<List<ConnectionRequestItem>> fetchSentRequests() async {
    try {
      final rows = await _api.getList(
        '/connections/requests/sent',
        authenticated: true,
      );
      return rows.map(ConnectionRequestItem.fromJson).toList();
    } on ApiException catch (e) {
      throw ConnectionException(e.message);
    }
  }

  Future<List<ConnectionUserPreview>> fetchConnections() async {
    try {
      final rows = await _api.getList('/connections', authenticated: true);
      return rows.map(ConnectionUserPreview.fromJson).toList();
    } on ApiException catch (e) {
      throw ConnectionException(e.message);
    }
  }

  Future<List<ConnectionNotificationItem>> fetchNotifications() async {
    try {
      final rows = await _api.getList('/notifications', authenticated: true);
      return rows.map(ConnectionNotificationItem.fromJson).toList();
    } on ApiException catch (e) {
      throw ConnectionException(e.message);
    }
  }

  Future<void> markNotificationRead(String notificationId) async {
    try {
      await _api.put(
        '/notifications/$notificationId/read',
        authenticated: true,
      );
    } on ApiException catch (e) {
      throw ConnectionException(e.message);
    }
  }

  Future<ProfileStats> fetchProfileStats() async {
    try {
      final json = await _api.get('/users/me/stats', authenticated: true);
      return ProfileStats.fromJson(json);
    } on ApiException catch (e) {
      throw ConnectionException(e.message);
    }
  }

  Future<void> recordProfileView(String targetUserId) async {
    if (targetUserId.isEmpty) return;
    try {
      await _api.post(
        '/users/$targetUserId/view',
        authenticated: true,
      );
    } on ApiException {
      // Non-blocking analytics.
    }
  }
}

class ProfileStats {
  const ProfileStats({
    required this.connections,
    required this.profileViews,
    required this.matches,
    required this.responseRate,
  });

  final int connections;
  final int profileViews;
  final int matches;
  final int responseRate;

  factory ProfileStats.fromJson(Map<String, dynamic> json) {
    return ProfileStats(
      connections: _asInt(json['connections']),
      profileViews: _asInt(json['profileViews']),
      matches: _asInt(json['matches']),
      responseRate: _asInt(json['responseRate']),
    );
  }

  static const empty = ProfileStats(
    connections: 0,
    profileViews: 0,
    matches: 0,
    responseRate: 0,
  );

  static int _asInt(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '') ?? 0;
  }
}

class ConnectionException implements Exception {
  ConnectionException(this.message);
  final String message;

  @override
  String toString() => message;
}
