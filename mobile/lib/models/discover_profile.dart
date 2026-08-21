import '../config/api_config.dart';
import '../constants/app_constants.dart';

class DiscoverProfile {
  DiscoverProfile({
    required this.id,
    required this.name,
    required this.role,
    required this.companyName,
    required this.companyTagline,
    required this.location,
    required this.industry,
    required this.revenueRange,
    required this.companySize,
    required List<String>? lookingFor,
    required List<String>? businessInterests,
    required this.about,
    this.badge = 'Founder',
    this.yearFounded = '',
    this.linkedinUrl = '',
    this.headline = '',
    this.connections = 0,
    this.profileViews = 0,
    this.matches = 0,
    this.responseRate = 0,
    this.avatarColor,
    this.profilePhotoUrl,
    this.companyLogoUrl,
    this.coverPhotoUrl,
    List<String>? galleryUrls,
  })  : _lookingFor = lookingFor,
        _businessInterests = businessInterests,
        _galleryUrls = galleryUrls;

  final String id;
  final String name;
  final String role;
  final String companyName;
  final String companyTagline;
  final String location;
  final String industry;
  final String revenueRange;
  final String companySize;
  final List<String>? _lookingFor;
  final List<String>? _businessInterests;
  final String about;
  final String badge;
  final String yearFounded;
  final String linkedinUrl;
  final String headline;
  final int connections;
  final int profileViews;
  final int matches;
  final int responseRate;
  final int? avatarColor;
  final String? profilePhotoUrl;
  final String? companyLogoUrl;
  final String? coverPhotoUrl;
  final List<String>? _galleryUrls;

  List<String> get lookingFor => _lookingFor ?? const [];
  List<String> get businessInterests => _businessInterests ?? const [];
  List<String> get galleryUrls => _galleryUrls ?? const [];

  factory DiscoverProfile.fromUserJson(Map<String, dynamic> json) {
    final firstName = _string(json['firstName']);
    final lastName = _string(json['lastName']);
    final founderName = _string(json['founderName']);
    final fullName = [firstName, lastName].where((p) => p.isNotEmpty).join(' ');
    final name = founderName.isNotEmpty
        ? founderName
        : (fullName.isNotEmpty ? fullName : 'Member');

    final companyName = _firstNonEmpty([
      _string(json['companyName']),
      _string(json['businessName']),
    ], fallback: 'Business');

    final role = _firstNonEmpty([
      _string(json['role']),
      _goalLabel(_string(json['businessGoal'])),
    ], fallback: 'Business professional');

    final headline = _string(json['headline']);
    final bio = _string(json['bio']);
    final city = _string(json['city']);
    final gallery = _stringList(json['businessGallery'])
        .map(_absoluteUrl)
        .whereType<String>()
        .toList();

    final stats = json['stats'];
    final statsMap = stats is Map<String, dynamic> ? stats : const <String, dynamic>{};

    return DiscoverProfile(
      id: _string(json['id']),
      name: name,
      role: role,
      companyName: companyName,
      companyTagline: headline.isNotEmpty
          ? headline
          : (bio.isNotEmpty ? bio : 'Member of BSquare'),
      location: city.isEmpty ? 'India' : '$city, India',
      industry: _firstNonEmpty([_string(json['industry'])], fallback: 'Not added'),
      revenueRange: _firstNonEmpty([
        _string(json['revenueRange']),
      ], fallback: 'Not added'),
      companySize: _firstNonEmpty([
        _string(json['companySize']),
      ], fallback: 'Not added'),
      lookingFor: _stringList(json['lookingFor']),
      businessInterests: _stringList(json['businessInterests']),
      about: bio.isNotEmpty ? bio : 'No business description added yet.',
      badge: role,
      yearFounded: _string(json['yearFounded']),
      linkedinUrl: _string(json['linkedinUrl']),
      headline: headline,
      connections: _asInt(statsMap['connections']),
      profileViews: _asInt(statsMap['profileViews']),
      matches: _asInt(statsMap['matches']),
      responseRate: _asInt(statsMap['responseRate']),
      avatarColor: _colorFor(name + companyName),
      profilePhotoUrl: _absoluteUrl(_nullable(json['profilePhoto'])),
      companyLogoUrl: _absoluteUrl(_nullable(json['companyLogo'])),
      coverPhotoUrl: gallery.isNotEmpty ? gallery.first : null,
      galleryUrls: gallery,
    );
  }

  static int _asInt(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '') ?? 0;
  }

  static String _string(dynamic value) => value?.toString().trim() ?? '';

  static String? _nullable(dynamic value) {
    final text = value?.toString().trim();
    if (text == null || text.isEmpty) return null;
    return text;
  }

  static List<String> _stringList(dynamic value) {
    if (value is! List) return [];
    return value
        .map((item) => item?.toString().trim() ?? '')
        .where((item) => item.isNotEmpty)
        .toList();
  }

  static String _firstNonEmpty(List<String> values, {required String fallback}) {
    for (final value in values) {
      if (value.isNotEmpty) return value;
    }
    return fallback;
  }

  static String _goalLabel(String value) {
    for (final goal in AppConstants.businessGoals) {
      if (goal.value == value) return goal.label;
    }
    return '';
  }

  static String? _absoluteUrl(String? path) {
    if (path == null || path.isEmpty) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return '${ApiConfig.baseUrl}$path';
  }

  static int _colorFor(String seed) {
    const colors = [0xFF7C6CFF, 0xFFD4FF3A, 0xFF4A90D9, 0xFFE8A87C, 0xFF7ED6C1];
    return colors[seed.hashCode.abs() % colors.length];
  }
}
