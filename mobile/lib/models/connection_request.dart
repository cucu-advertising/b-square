import '../config/api_config.dart';

class ConnectionUserPreview {
  const ConnectionUserPreview({
    required this.id,
    required this.name,
    required this.roleCompany,
    required this.location,
    this.profilePhotoUrl,
    this.companyName = '',
  });

  final String id;
  final String name;
  final String roleCompany;
  final String location;
  final String? profilePhotoUrl;
  final String companyName;

  factory ConnectionUserPreview.fromJson(Map<String, dynamic> json) {
    return ConnectionUserPreview(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString().trim().isNotEmpty == true
          ? json['name'].toString().trim()
          : 'Member',
      roleCompany: json['roleCompany']?.toString() ?? '',
      location: json['location']?.toString() ?? '',
      profilePhotoUrl: _absoluteUrl(json['profilePhoto']?.toString()),
      companyName: json['companyName']?.toString() ?? '',
    );
  }

  static String? _absoluteUrl(String? path) {
    if (path == null || path.isEmpty) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return '${ApiConfig.baseUrl}$path';
  }
}

class ConnectionRequestItem {
  const ConnectionRequestItem({
    required this.id,
    required this.status,
    required this.user,
    this.fromUserId,
    this.toUserId,
  });

  final String id;
  final String status;
  final ConnectionUserPreview user;
  final String? fromUserId;
  final String? toUserId;

  factory ConnectionRequestItem.fromJson(Map<String, dynamic> json) {
    final userJson = json['user'];
    return ConnectionRequestItem(
      id: json['id']?.toString() ?? '',
      status: json['status']?.toString() ?? 'pending',
      fromUserId: json['fromUserId']?.toString(),
      toUserId: json['toUserId']?.toString(),
      user: userJson is Map<String, dynamic>
          ? ConnectionUserPreview.fromJson(userJson)
          : const ConnectionUserPreview(
              id: '',
              name: 'Member',
              roleCompany: '',
              location: '',
            ),
    );
  }
}

class ConnectionNotificationItem {
  const ConnectionNotificationItem({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    required this.fromUserName,
    required this.isRead,
    this.fromProfilePhotoUrl,
    this.fromRoleCompany = '',
    this.fromLocation = '',
    this.requestId,
  });

  final String id;
  final String type;
  final String title;
  final String body;
  final String fromUserName;
  final bool isRead;
  final String? fromProfilePhotoUrl;
  final String fromRoleCompany;
  final String fromLocation;
  final String? requestId;

  bool get isAccepted => type == 'connection_accepted';
  bool get isDeclined => type == 'connection_declined';

  factory ConnectionNotificationItem.fromJson(Map<String, dynamic> json) {
    return ConnectionNotificationItem(
      id: json['id']?.toString() ?? '',
      type: json['type']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      body: json['body']?.toString() ?? '',
      fromUserName: json['fromUserName']?.toString() ?? 'Member',
      isRead: json['isRead'] == true,
      fromProfilePhotoUrl: ConnectionUserPreview._absoluteUrl(
        json['fromProfilePhoto']?.toString(),
      ),
      fromRoleCompany: json['fromRoleCompany']?.toString() ?? '',
      fromLocation: json['fromLocation']?.toString() ?? '',
      requestId: json['requestId']?.toString(),
    );
  }
}
