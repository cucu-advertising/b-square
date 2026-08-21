import '../config/api_config.dart';

class ChatConversation {
  const ChatConversation({
    required this.id,
    required this.peerUserId,
    required this.peerName,
    required this.lastMessage,
    required this.unreadCount,
    this.peerProfilePhotoUrl,
    this.peerCompanyName = '',
    this.lastMessageAt,
    this.lastSenderId,
  });

  final String id;
  final String peerUserId;
  final String peerName;
  final String lastMessage;
  final int unreadCount;
  final String? peerProfilePhotoUrl;
  final String peerCompanyName;
  final DateTime? lastMessageAt;
  final String? lastSenderId;

  factory ChatConversation.fromJson(Map<String, dynamic> json) {
    return ChatConversation(
      id: json['id']?.toString() ?? '',
      peerUserId: json['peerUserId']?.toString() ?? '',
      peerName: (json['peerName']?.toString().trim().isNotEmpty == true)
          ? json['peerName'].toString().trim()
          : 'Member',
      peerProfilePhotoUrl: _absoluteUrl(json['peerProfilePhoto']?.toString()),
      peerCompanyName: json['peerCompanyName']?.toString() ?? '',
      lastMessage: json['lastMessage']?.toString() ?? '',
      lastMessageAt: _parseDate(json['lastMessageAt']),
      lastSenderId: json['lastSenderId']?.toString(),
      unreadCount: _asInt(json['unreadCount']),
    );
  }

  static int _asInt(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '') ?? 0;
  }

  static DateTime? _parseDate(dynamic value) {
    if (value == null) return null;
    return DateTime.tryParse(value.toString())?.toLocal();
  }

  static String? _absoluteUrl(String? path) {
    if (path == null || path.isEmpty) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return '${ApiConfig.baseUrl}$path';
  }
}

class ChatMessage {
  const ChatMessage({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.receiverId,
    required this.content,
    required this.createdAt,
    this.readAt,
  });

  final String id;
  final String conversationId;
  final String senderId;
  final String receiverId;
  final String content;
  final DateTime createdAt;
  final DateTime? readAt;

  bool isMine(String currentUserId) => senderId == currentUserId;

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id']?.toString() ?? '',
      conversationId: json['conversationId']?.toString() ?? '',
      senderId: json['senderId']?.toString() ?? '',
      receiverId: json['receiverId']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '')?.toLocal() ??
          DateTime.now(),
      readAt: DateTime.tryParse(json['readAt']?.toString() ?? '')?.toLocal(),
    );
  }
}
