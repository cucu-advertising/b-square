import 'dart:typed_data';

import '../constants/app_constants.dart';

class SignupData {
  String id = '';
  String phone = '';
  String firstName = '';
  String lastName = '';
  String email = '';
  String password = '';
  String confirmPassword = '';
  String businessName = '';
  String industry = '';
  String city = '';
  String bio = '';
  VerificationType verificationType = VerificationType.din;
  String dinNumber = '';
  String dinDirectorName = '';
  String linkedinUrl = '';
  String successionPrevDin = '';
  String successionNewDin = '';
  String successionDocNote = '';
  String founderName = '';
  String companyName = '';
  String role = '';
  String headline = "I'm a Member of BSquare";
  String yearFounded = '';
  String companySize = '';
  String revenueRange = '';
  String businessGoal = '';
  List<String> lookingFor = [];
  List<String> businessInterests = [];
  Uint8List? profilePhotoBytes;
  String? profilePhotoPath;
  String? profilePhotoUrl;
  Uint8List? companyLogoBytes;
  String? companyLogoPath;
  String? companyLogoUrl;
  List<Uint8List> businessGalleryBytes = [];
  List<String> businessGalleryPaths = [];
  List<String> businessGalleryUrls = [];
  double? latitude;
  double? longitude;
  bool locationEnabled = false;

  String get fullName {
    final parts = [
      firstName.trim(),
      lastName.trim(),
    ].where((p) => p.isNotEmpty);
    return parts.join(' ');
  }

  /// Merge a `/auth/login`, `/auth/register`, or `/auth/me` user object.
  void applyFromUserJson(Map<String, dynamic> json) {
    id = _string(json['id']);
    firstName = _string(json['firstName']);
    lastName = _string(json['lastName']);
    email = _string(json['email']);
    businessName = _string(json['businessName']);
    industry = _string(json['industry']);
    city = _string(json['city']);
    bio = _string(json['bio']);
    founderName = _string(json['founderName']);
    companyName = _string(json['companyName']);
    role = _string(json['role']);
    final nextHeadline = _string(json['headline']);
    if (nextHeadline.isNotEmpty) headline = nextHeadline;
    yearFounded = _string(json['yearFounded']);
    companySize = _string(json['companySize']);
    revenueRange = _string(json['revenueRange']);
    businessGoal = _string(json['businessGoal']);
    lookingFor = _stringList(json['lookingFor']);
    businessInterests = _stringList(json['businessInterests']);
    dinNumber = _string(json['dinNumber']);
    dinDirectorName = _string(json['dinDirectorName']);
    linkedinUrl = _string(json['linkedinUrl']);
    successionPrevDin = _string(json['successionPrevDin']);
    successionNewDin = _string(json['successionNewDin']);
    successionDocNote = _string(json['successionDocNote']);
    latitude = _double(json['latitude']);
    longitude = _double(json['longitude']);
    locationEnabled = json['locationEnabled'] == true;

    final verification = _string(json['verificationType']);
    verificationType = VerificationType.values.firstWhere(
      (v) => v.name == verification,
      orElse: () => VerificationType.din,
    );

    profilePhotoUrl = _nullableString(json['profilePhoto']);
    companyLogoUrl = _nullableString(json['companyLogo']);
    businessGalleryUrls = _stringList(json['businessGallery']);
  }

  static String _string(dynamic value) => value?.toString().trim() ?? '';

  static String? _nullableString(dynamic value) {
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

  static double? _double(dynamic value) {
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '');
  }

  Map<String, dynamic> toRegistrationPayload() {
    final coords = _resolveCoordinates();
    return {
      'firstName': firstName.trim(),
      'lastName': lastName.trim(),
      'businessName': businessName.trim(),
      'industry': industry,
      'city': city,
      'bio': bio.trim(),
      'email': email.trim().toLowerCase(),
      'password': password,
      'verificationType': verificationType.name,
      'dinNumber': verificationType == VerificationType.din
          ? dinNumber.trim()
          : null,
      'dinDirectorName': verificationType == VerificationType.din
          ? dinDirectorName.trim()
          : null,
      'linkedinUrl': verificationType == VerificationType.linkedin
          ? linkedinUrl.trim()
          : null,
      'successionPrevDin': successionPrevDin.trim().isEmpty
          ? null
          : successionPrevDin.trim(),
      'successionNewDin': successionNewDin.trim().isEmpty
          ? null
          : successionNewDin.trim(),
      'successionDocNote': verificationType == VerificationType.succession
          ? successionDocNote.trim()
          : null,
      'latitude': coords.$1,
      'longitude': coords.$2,
      'locationEnabled': locationEnabled,
    };
  }

  Map<String, dynamic> toOnboardingPayload() {
    return {
      'founderName': founderName.isEmpty ? fullName : founderName,
      'lookingFor': lookingFor,
      'businessGoal': businessGoal,
      'companySize': companySize,
      'revenueRange': revenueRange,
      'businessInterests': businessInterests,
      'yearFounded': yearFounded,
      'companyName': companyName.isEmpty ? businessName : companyName,
      'role': role,
      'headline': headline,
      'latitude': latitude,
      'longitude': longitude,
      'locationEnabled': locationEnabled,
    };
  }

  Map<String, dynamic> toProfileUpdatePayload() {
    final name = founderName.trim().isNotEmpty ? founderName.trim() : fullName;
    final parts = name.split(RegExp(r'\s+'));
    return {
      'firstName': firstName.trim().isNotEmpty
          ? firstName.trim()
          : (parts.isNotEmpty ? parts.first : ''),
      'lastName': lastName.trim().isNotEmpty
          ? lastName.trim()
          : (parts.length > 1 ? parts.skip(1).join(' ') : ''),
      'founderName': name,
      'city': city,
      'industry': industry,
      'bio': bio.trim(),
      'headline': headline.trim().isEmpty
          ? "I'm a Member of BSquare"
          : headline.trim(),
      'businessName':
          businessName.trim().isEmpty ? companyName.trim() : businessName.trim(),
      'companyName':
          companyName.trim().isEmpty ? businessName.trim() : companyName.trim(),
      'role': role.trim(),
      'yearFounded': yearFounded,
      'companySize': companySize,
      'revenueRange': revenueRange,
      'businessGoal': businessGoal,
      'lookingFor': lookingFor,
      'businessInterests': businessInterests,
      'linkedinUrl': linkedinUrl.trim(),
    };
  }

  (double, double) _resolveCoordinates() {
    if (latitude != null && longitude != null) {
      return (latitude!, longitude!);
    }
    final cityCoords = AppConstants.cities[city];
    if (cityCoords != null) {
      return (cityCoords[0], cityCoords[1]);
    }
    return (17.385, 78.4867);
  }
}
