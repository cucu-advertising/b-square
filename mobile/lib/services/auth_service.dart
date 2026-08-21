import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';

import '../config/api_config.dart';
import '../models/discover_profile.dart';
import '../models/signup_data.dart';
import 'api_client.dart';
import 'chat_socket.dart';
import 'token_storage.dart';

class AuthService {
  AuthService({ApiClient? apiClient, TokenStorage? tokenStorage})
    : _api = apiClient ?? ApiClient.instance,
      _tokens = tokenStorage ?? TokenStorage.instance;

  final ApiClient _api;
  final TokenStorage _tokens;

  /// Phone OTP is UI-only until an SMS provider is added on the backend.
  Future<void> sendOtp(String phone) async {
    if (phone.length != 10) {
      throw AuthException('Enter a valid 10-digit phone number');
    }
  }

  Future<void> verifyOtp(String phone, String code) async {
    if (code.length != 6) {
      throw AuthException('Enter the 6-digit verification code');
    }
  }

  Future<Map<String, dynamic>> register(SignupData data) async {
    try {
      final response = await _api.post('/auth/register', body: data.toRegistrationPayload());
      await _persistAuthResponse(response);
      await _uploadImages(data);
      try {
        return await fetchCurrentUser();
      } catch (_) {
        return _userFromAuthResponse(response);
      }
    } on ApiException catch (e) {
      throw AuthException(e.message);
    }
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _api.post(
        '/auth/login',
        body: {'email': email.trim().toLowerCase(), 'password': password},
      );
      await _persistAuthResponse(response);
      return _userFromAuthResponse(response);
    } on ApiException catch (e) {
      throw AuthException(e.message);
    }
  }

  Future<Map<String, dynamic>> fetchCurrentUser() async {
    try {
      final user = await _api.get('/auth/me', authenticated: true);
      return _withAbsoluteMediaUrls(user);
    } on ApiException catch (e) {
      throw AuthException(e.message);
    }
  }

  Future<List<DiscoverProfile>> fetchDiscoverProfiles() async {
    try {
      final users = await _api.getList('/users/discover', authenticated: true);
      return users.map(DiscoverProfile.fromUserJson).toList();
    } on ApiException catch (e) {
      throw AuthException(e.message);
    }
  }

  Future<DiscoverProfile> fetchUserProfile(String userId) async {
    try {
      final user = await _api.get('/users/$userId', authenticated: true);
      return DiscoverProfile.fromUserJson(_withAbsoluteMediaUrls(user));
    } on ApiException catch (e) {
      throw AuthException(e.message);
    }
  }

  Future<void> saveOnboarding(SignupData data) async {
    try {
      await _api.patch('/users/me/onboarding', body: data.toOnboardingPayload());
    } on ApiException catch (e) {
      throw AuthException(e.message);
    }
  }

  Future<Map<String, dynamic>> updateProfile(SignupData data) async {
    try {
      final user = await _api.patch(
        '/users/me/profile',
        body: data.toProfileUpdatePayload(),
        authenticated: true,
      );
      if (data.profilePhotoBytes != null) {
        await _uploadImages(data);
        return await fetchCurrentUser();
      }
      return _withAbsoluteMediaUrls(user);
    } on ApiException catch (e) {
      throw AuthException(e.message);
    }
  }

  Future<void> logout() async {
    try {
      final refresh = await _tokens.refreshToken;
      if (refresh != null && refresh.isNotEmpty) {
        await _api.post('/auth/logout', body: {'refreshToken': refresh});
      }
    } catch (_) {
      // Clear local session even if the server call fails.
    } finally {
      await ChatSocket.instance.disconnect();
      await _tokens.clear();
    }
  }

  Future<bool> get isLoggedIn => _tokens.hasSession;

  Future<void> _persistAuthResponse(Map<String, dynamic> response) async {
    final access = response['accessToken'] as String?;
    final refresh = response['refreshToken'] as String?;
    if (access == null || refresh == null) {
      throw AuthException('Invalid server response');
    }
    await _tokens.saveTokens(accessToken: access, refreshToken: refresh);
  }

  Map<String, dynamic> _userFromAuthResponse(Map<String, dynamic> response) {
    final user = response['user'];
    if (user is! Map<String, dynamic>) {
      throw AuthException('Invalid server response');
    }
    return _withAbsoluteMediaUrls(user);
  }

  Map<String, dynamic> _withAbsoluteMediaUrls(Map<String, dynamic> user) {
    final mapped = Map<String, dynamic>.from(user);
    mapped['profilePhoto'] = _absoluteUrl(mapped['profilePhoto']?.toString());
    mapped['companyLogo'] = _absoluteUrl(mapped['companyLogo']?.toString());
    final gallery = mapped['businessGallery'];
    if (gallery is List) {
      mapped['businessGallery'] = gallery
          .map((item) => _absoluteUrl(item?.toString()))
          .whereType<String>()
          .toList();
    }
    return mapped;
  }

  String? _absoluteUrl(String? path) {
    if (path == null || path.isEmpty) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return '${ApiConfig.baseUrl}$path';
  }

  Future<void> _uploadImages(SignupData data) async {
    final files = <http.MultipartFile>[];

    if (data.profilePhotoBytes != null) {
      files.add(
        _imagePart(
          'profilePhoto',
          data.profilePhotoBytes!,
          data.profilePhotoPath,
          'profile.jpg',
        ),
      );
    }

    if (data.companyLogoBytes != null) {
      files.add(
        _imagePart(
          'companyLogo',
          data.companyLogoBytes!,
          data.companyLogoPath,
          'logo.jpg',
        ),
      );
    }

    for (var i = 0; i < data.businessGalleryBytes.length; i++) {
      files.add(
        _imagePart(
          'gallery',
          data.businessGalleryBytes[i],
          i < data.businessGalleryPaths.length ? data.businessGalleryPaths[i] : null,
          'gallery_$i.jpg',
        ),
      );
    }

    if (files.isEmpty) return;

    await _api.postMultipart('/users/me/images', files: files);
  }

  /// Mobile gallery picks often have no MIME type; image_picker with
  /// [imageQuality] re-encodes to JPEG, so send an explicit image content-type.
  http.MultipartFile _imagePart(
    String field,
    List<int> bytes,
    String? path,
    String fallbackName,
  ) {
    final name = _imageFileName(path, fallbackName);
    return http.MultipartFile.fromBytes(
      field,
      bytes,
      filename: name,
      contentType: _mediaTypeFor(name),
    );
  }

  String _imageFileName(String? path, String fallback) {
    if (path == null || path.isEmpty) return fallback;
    final parts = path.split(RegExp(r'[/\\]'));
    final raw = parts.isNotEmpty ? parts.last : fallback;
    final lower = raw.toLowerCase();
    if (lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.png') ||
        lower.endsWith('.webp') ||
        lower.endsWith('.gif')) {
      return raw;
    }
    // Content URIs / HEIC / no extension from the phone Photos app.
    return fallback;
  }

  MediaType _mediaTypeFor(String filename) {
    final lower = filename.toLowerCase();
    if (lower.endsWith('.png')) return MediaType('image', 'png');
    if (lower.endsWith('.webp')) return MediaType('image', 'webp');
    if (lower.endsWith('.gif')) return MediaType('image', 'gif');
    return MediaType('image', 'jpeg');
  }
}

class AuthException implements Exception {
  AuthException(this.message);
  final String message;

  @override
  String toString() => message;
}
