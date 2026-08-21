import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';
import 'token_storage.dart';

/// Shared API client so auth + connections use the same token store.
class ApiClient {
  ApiClient({http.Client? client, TokenStorage? tokenStorage})
    : _client = client ?? http.Client(),
      _tokenStorage = tokenStorage ?? TokenStorage.instance;

  static final ApiClient instance = ApiClient();

  final http.Client _client;
  final TokenStorage _tokenStorage;
  Future<bool>? _refreshInFlight;

  Future<Map<String, dynamic>> get(
    String path, {
    bool authenticated = false,
  }) async {
    final result = await _send(
      () async => _client.get(_uri(path), headers: await _headers(authenticated)),
      authenticated: authenticated,
      asMap: true,
    );
    return result as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> getList(
    String path, {
    bool authenticated = false,
  }) async {
    final result = await _send(
      () async => _client.get(_uri(path), headers: await _headers(authenticated)),
      authenticated: authenticated,
      asMap: false,
    );
    return result as List<Map<String, dynamic>>;
  }

  Future<Map<String, dynamic>> post(
    String path, {
    Map<String, dynamic>? body,
    bool authenticated = false,
  }) async {
    final result = await _send(
      () async => _client.post(
        _uri(path),
        headers: await _headers(authenticated),
        body: body == null ? null : jsonEncode(body),
      ),
      authenticated: authenticated,
      asMap: true,
    );
    return result as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> patch(
    String path, {
    required Map<String, dynamic> body,
    bool authenticated = true,
  }) async {
    final result = await _send(
      () async => _client.patch(
        _uri(path),
        headers: await _headers(authenticated),
        body: jsonEncode(body),
      ),
      authenticated: authenticated,
      asMap: true,
    );
    return result as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> put(
    String path, {
    Map<String, dynamic>? body,
    bool authenticated = true,
  }) async {
    final result = await _send(
      () async => _client.put(
        _uri(path),
        headers: await _headers(authenticated),
        body: body == null ? null : jsonEncode(body),
      ),
      authenticated: authenticated,
      asMap: true,
    );
    return result as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> delete(
    String path, {
    bool authenticated = true,
  }) async {
    final result = await _send(
      () async => _client.delete(_uri(path), headers: await _headers(authenticated)),
      authenticated: authenticated,
      asMap: true,
    );
    return result as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> postMultipart(
    String path, {
    required List<http.MultipartFile> files,
    bool authenticated = true,
  }) async {
    Future<http.Response> sendOnce() async {
      final request = http.MultipartRequest('POST', _uri(path));
      final headers = await _headers(authenticated);
      headers.remove('Content-Type');
      request.headers.addAll(headers);
      request.files.addAll(files);
      final streamed = await _client.send(request);
      return http.Response.fromStream(streamed);
    }

    final result = await _send(
      sendOnce,
      authenticated: authenticated,
      asMap: true,
    );
    return result as Map<String, dynamic>;
  }

  Future<Object> _send(
    Future<http.Response> Function() send, {
    required bool authenticated,
    required bool asMap,
  }) async {
    var response = await send();
    if (authenticated && response.statusCode == 401) {
      final refreshed = await _tryRefresh();
      if (refreshed) {
        response = await send();
      }
    }

    if (asMap) {
      return _decodeMap(response);
    }
    return _decodeList(response);
  }

  Future<bool> _tryRefresh() async {
    if (_refreshInFlight != null) {
      return _refreshInFlight!;
    }

    _refreshInFlight = () async {
      try {
        final refresh = await _tokenStorage.refreshToken;
        if (refresh == null || refresh.isEmpty) return false;

        final response = await _client.post(
          _uri('/auth/refresh'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'refreshToken': refresh}),
        );
        if (response.statusCode < 200 || response.statusCode >= 300) {
          return false;
        }

        final body = _decodedBody(response);
        if (body is! Map<String, dynamic>) return false;
        final access = body['accessToken']?.toString();
        final nextRefresh = body['refreshToken']?.toString();
        if (access == null ||
            access.isEmpty ||
            nextRefresh == null ||
            nextRefresh.isEmpty) {
          return false;
        }

        await _tokenStorage.saveTokens(
          accessToken: access,
          refreshToken: nextRefresh,
        );
        return true;
      } catch (_) {
        return false;
      } finally {
        _refreshInFlight = null;
      }
    }();

    return _refreshInFlight!;
  }

  Uri _uri(String path) => Uri.parse('${ApiConfig.apiV1}$path');

  Future<Map<String, String>> _headers(bool authenticated) async {
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (authenticated) {
      final token = await _tokenStorage.accessToken;
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }
    return headers;
  }

  dynamic _decodedBody(http.Response response) {
    if (response.body.isEmpty) return null;
    return jsonDecode(response.body);
  }

  Never _throwHttpError(http.Response response, dynamic decoded) {
    String message = 'Request failed (${response.statusCode})';
    if (decoded is Map<String, dynamic>) {
      message = decoded['error']?.toString() ??
          decoded['detail']?.toString() ??
          message;
    }
    throw ApiException(message, statusCode: response.statusCode);
  }

  Map<String, dynamic> _decodeMap(http.Response response) {
    final decoded = _decodedBody(response);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      _throwHttpError(response, decoded);
    }
    if (decoded is Map<String, dynamic>) return decoded;
    return {};
  }

  List<Map<String, dynamic>> _decodeList(http.Response response) {
    final decoded = _decodedBody(response);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      _throwHttpError(response, decoded);
    }
    if (decoded is! List) return [];
    return decoded
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList();
  }
}

class ApiException implements Exception {
  ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}
