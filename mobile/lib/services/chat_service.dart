import '../models/chat_models.dart';
import 'api_client.dart';

class ChatService {
  ChatService({ApiClient? apiClient}) : _api = apiClient ?? ApiClient.instance;

  final ApiClient _api;

  Future<List<ChatConversation>> fetchConversations() async {
    try {
      final rows = await _api.getList('/messages', authenticated: true);
      return rows.map(ChatConversation.fromJson).toList();
    } on ApiException catch (e) {
      throw ChatException(e.message);
    }
  }

  Future<List<ChatMessage>> fetchMessages(
    String peerUserId, {
    int limit = 50,
  }) async {
    try {
      final rows = await _api.getList(
        '/messages/$peerUserId?limit=$limit',
        authenticated: true,
      );
      return rows.map(ChatMessage.fromJson).toList();
    } on ApiException catch (e) {
      throw ChatException(e.message);
    }
  }

  Future<ChatMessage> sendMessage(String peerUserId, String content) async {
    try {
      final json = await _api.post(
        '/messages/$peerUserId',
        body: {'content': content},
        authenticated: true,
      );
      return ChatMessage.fromJson(json);
    } on ApiException catch (e) {
      throw ChatException(e.message);
    }
  }

  Future<void> markRead(String peerUserId) async {
    try {
      await _api.put(
        '/messages/$peerUserId/read',
        authenticated: true,
      );
    } on ApiException catch (e) {
      throw ChatException(e.message);
    }
  }
}

class ChatException implements Exception {
  ChatException(this.message);
  final String message;

  @override
  String toString() => message;
}
