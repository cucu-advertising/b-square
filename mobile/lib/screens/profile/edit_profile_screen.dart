import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../config/api_config.dart';
import '../../constants/app_constants.dart';
import '../../models/signup_data.dart';
import '../../providers/signup_flow_provider.dart';
import '../../services/auth_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/auth_background.dart';
import '../../widgets/onboarding/onboarding_dropdown_field.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _auth = AuthService();
  final _picker = ImagePicker();

  late final TextEditingController _nameController;
  late final TextEditingController _headlineController;
  late final TextEditingController _companyController;
  late final TextEditingController _bioController;
  late final TextEditingController _roleController;
  late final TextEditingController _linkedinController;

  String _city = '';
  String _industry = '';
  String _revenueRange = '';
  String _companySize = '';
  String _yearFounded = '';
  List<String> _lookingFor = [];
  List<String> _interests = [];

  Uint8List? _photoBytes;
  String? _photoPath;
  String? _photoUrl;
  bool _saving = false;

  static const _headlineMax = 120;
  static const _bioMax = 300;
  static const _maxInterests = 5;

  @override
  void initState() {
    super.initState();
    final data = context.read<SignupFlowProvider>().data;
    final name = data.founderName.trim().isNotEmpty
        ? data.founderName.trim()
        : data.fullName.trim();

    _nameController = TextEditingController(text: name);
    _headlineController = TextEditingController(text: data.headline);
    _companyController = TextEditingController(
      text: data.companyName.trim().isNotEmpty
          ? data.companyName
          : data.businessName,
    );
    _bioController = TextEditingController(text: data.bio);
    _roleController = TextEditingController(text: data.role);
    _linkedinController = TextEditingController(text: data.linkedinUrl);

    _city = data.city;
    _industry = data.industry;
    _revenueRange = data.revenueRange;
    _companySize = data.companySize;
    _yearFounded = data.yearFounded;
    _lookingFor = List<String>.from(data.lookingFor);
    _interests = List<String>.from(data.businessInterests);
    _photoBytes = data.profilePhotoBytes;
    _photoUrl = data.profilePhotoUrl;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _headlineController.dispose();
    _companyController.dispose();
    _bioController.dispose();
    _roleController.dispose();
    _linkedinController.dispose();
    super.dispose();
  }

  Future<void> _changePhoto() async {
    final file = await _picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1200,
      imageQuality: 85,
    );
    if (file == null) return;
    final bytes = await file.readAsBytes();
    if (!mounted) return;
    setState(() {
      _photoBytes = bytes;
      _photoPath = file.path;
    });
  }

  Future<void> _save() async {
    final name = _nameController.text.trim();
    if (name.isEmpty) {
      _snack('Enter your full name');
      return;
    }
    if (_city.isEmpty) {
      _snack('Select your city');
      return;
    }

    setState(() => _saving = true);
    try {
      final draft = SignupData()
        ..founderName = name
        ..firstName = name.split(RegExp(r'\s+')).first
        ..lastName = name.split(RegExp(r'\s+')).skip(1).join(' ')
        ..city = _city
        ..industry = _industry
        ..headline = _headlineController.text.trim()
        ..bio = _bioController.text.trim()
        ..companyName = _companyController.text.trim()
        ..businessName = _companyController.text.trim()
        ..role = _roleController.text.trim()
        ..yearFounded = _yearFounded
        ..companySize = _companySize
        ..revenueRange = _revenueRange
        ..lookingFor = _lookingFor
        ..businessInterests = _interests
        ..linkedinUrl = _linkedinController.text.trim()
        ..profilePhotoBytes = _photoBytes
        ..profilePhotoPath = _photoPath;

      // Keep existing business goal from provider (not on this form).
      draft.businessGoal =
          context.read<SignupFlowProvider>().data.businessGoal;

      final user = await _auth.updateProfile(draft);
      if (!mounted) return;
      context.read<SignupFlowProvider>().applyUser(user);
      _snack('Profile updated');
      Navigator.of(context).pop();
    } on AuthException catch (e) {
      if (!mounted) return;
      _snack(e.message);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _snack(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  void _toggleLookingFor(String value) {
    setState(() {
      if (_lookingFor.contains(value)) {
        _lookingFor.remove(value);
      } else {
        _lookingFor.add(value);
      }
    });
  }

  void _toggleInterest(String value) {
    setState(() {
      if (_interests.contains(value)) {
        _interests.remove(value);
      } else if (_interests.length < _maxInterests) {
        _interests.add(value);
      } else {
        _snack('Select up to $_maxInterests interests');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary,
      body: Stack(
        fit: StackFit.expand,
        children: [
          const AuthBackground(),
          SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(12, 4, 16, 8),
                  child: Row(
                    children: [
                      IconButton(
                        onPressed: () => Navigator.of(context).pop(),
                        icon: const Icon(
                          Icons.arrow_back_rounded,
                          color: AppColors.white,
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Edit Profile',
                              style: AppTheme.manrope(
                                fontSize: 22,
                                fontWeight: FontWeight.w700,
                                color: AppColors.white,
                              ),
                            ),
                            Text(
                              'Update your information and grow your network',
                              style: AppTheme.manrope(
                                fontSize: 12,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      TextButton(
                        onPressed: _saving ? null : _save,
                        style: TextButton.styleFrom(
                          backgroundColor: AppColors.purple,
                          foregroundColor: AppColors.white,
                          disabledBackgroundColor:
                              AppColors.purple.withValues(alpha: 0.5),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 18,
                            vertical: 10,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppRadius.sm),
                          ),
                        ),
                        child: Text(
                          _saving ? 'Saving...' : 'Save',
                          style: AppTheme.manrope(
                            fontWeight: FontWeight.w700,
                            color: AppColors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
                    children: [
                      _PhotoSection(
                        photoBytes: _photoBytes,
                        photoUrl: _photoUrl,
                        onChangePhoto: _changePhoto,
                      ),
                      const SizedBox(height: 28),
                      _SectionHeader(
                        icon: Icons.person_outline_rounded,
                        title: 'Basic Information',
                      ),
                      const SizedBox(height: 14),
                      _LabeledField(
                        label: 'Full Name',
                        controller: _nameController,
                        hint: 'Your full name',
                      ),
                      const SizedBox(height: 14),
                      OnboardingDropdownField(
                        label: 'Location (City)',
                        value: _city,
                        hint: 'Select city',
                        options: AppConstants.cities.keys.toList(),
                        onChanged: (v) => setState(() => _city = v ?? ''),
                      ),
                      const SizedBox(height: 14),
                      _LabeledField(
                        label: 'Headline / About',
                        controller: _headlineController,
                        hint: 'A short headline about you',
                        maxLines: 3,
                        maxLength: _headlineMax,
                      ),
                      const SizedBox(height: 28),
                      _SectionHeader(
                        icon: Icons.work_outline_rounded,
                        title: 'Business Information',
                      ),
                      const SizedBox(height: 14),
                      _LabeledField(
                        label: 'Company / Business Name',
                        controller: _companyController,
                        hint: 'Company name',
                      ),
                      const SizedBox(height: 14),
                      OnboardingDropdownField(
                        label: 'Industry',
                        value: _industry,
                        hint: 'Select industry',
                        options: AppConstants.industries,
                        onChanged: (v) => setState(() => _industry = v ?? ''),
                      ),
                      const SizedBox(height: 14),
                      OnboardingDropdownField(
                        label: 'Annual Revenue Range',
                        value: _revenueRange,
                        hint: 'Select range',
                        options: AppConstants.revenueRanges,
                        onChanged: (v) =>
                            setState(() => _revenueRange = v ?? ''),
                      ),
                      const SizedBox(height: 14),
                      OnboardingDropdownField(
                        label: 'Company Size',
                        value: _companySize,
                        hint: 'Select size',
                        options: AppConstants.companySizes,
                        onChanged: (v) =>
                            setState(() => _companySize = v ?? ''),
                      ),
                      const SizedBox(height: 18),
                      Text(
                        'Interested to Connect',
                        style: AppTheme.manrope(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: AppColors.lightMuted,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: AppConstants.connectWith.map((option) {
                          final selected = _lookingFor.contains(option);
                          return _SelectChip(
                            label: option,
                            selected: selected,
                            trailing: selected
                                ? Icons.check_rounded
                                : Icons.add_rounded,
                            onTap: () => _toggleLookingFor(option),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 18),
                      Text(
                        'Business Interests (Select up to $_maxInterests)',
                        style: AppTheme.manrope(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: AppColors.lightMuted,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: AppConstants.interests.map((option) {
                          final selected = _interests.contains(option);
                          return _SelectChip(
                            label: option,
                            selected: selected,
                            trailing: selected
                                ? Icons.close_rounded
                                : Icons.add_rounded,
                            onTap: () => _toggleInterest(option),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 14),
                      _LabeledField(
                        label: 'Business Details',
                        controller: _bioController,
                        hint: 'Describe your business',
                        maxLines: 4,
                        maxLength: _bioMax,
                      ),
                      const SizedBox(height: 28),
                      _SectionHeader(
                        icon: Icons.badge_outlined,
                        title: 'Personal Information',
                      ),
                      const SizedBox(height: 14),
                      _LabeledField(
                        label: 'Your Role / Designation',
                        controller: _roleController,
                        hint: 'e.g. Founder & CEO',
                      ),
                      const SizedBox(height: 14),
                      OnboardingDropdownField(
                        label: 'Year Founded',
                        value: _yearFounded,
                        hint: 'Select year',
                        options: AppConstants.foundedYears,
                        onChanged: (v) =>
                            setState(() => _yearFounded = v ?? ''),
                      ),
                      const SizedBox(height: 14),
                      _LabeledField(
                        label: 'LinkedIn Profile (Optional)',
                        controller: _linkedinController,
                        hint: 'https://linkedin.com/in/...',
                        keyboardType: TextInputType.url,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PhotoSection extends StatelessWidget {
  const _PhotoSection({
    required this.photoBytes,
    required this.photoUrl,
    required this.onChangePhoto,
  });

  final Uint8List? photoBytes;
  final String? photoUrl;
  final VoidCallback onChangePhoto;

  @override
  Widget build(BuildContext context) {
    ImageProvider? image;
    if (photoBytes != null) {
      image = MemoryImage(photoBytes!);
    } else if (photoUrl != null && photoUrl!.isNotEmpty) {
      final url = photoUrl!.startsWith('http')
          ? photoUrl!
          : '${ApiConfig.baseUrl}$photoUrl';
      image = NetworkImage(url);
    }

    return Center(
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          CircleAvatar(
            radius: 52,
            backgroundColor: AppColors.secondary,
            backgroundImage: image,
            child: image == null
                ? const Icon(
                    Icons.person_rounded,
                    size: 46,
                    color: AppColors.textSecondary,
                  )
                : null,
          ),
          Positioned(
            right: -2,
            bottom: -2,
            child: Material(
              color: AppColors.purple,
              shape: const CircleBorder(),
              child: InkWell(
                customBorder: const CircleBorder(),
                onTap: onChangePhoto,
                child: const SizedBox(
                  width: 34,
                  height: 34,
                  child: Icon(
                    Icons.photo_camera_outlined,
                    size: 17,
                    color: AppColors.white,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.icon, required this.title});

  final IconData icon;
  final String title;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 20, color: AppColors.accent),
        const SizedBox(width: 8),
        Text(
          title,
          style: AppTheme.manrope(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: AppColors.white,
          ),
        ),
      ],
    );
  }
}

class _LabeledField extends StatelessWidget {
  const _LabeledField({
    required this.label,
    required this.controller,
    required this.hint,
    this.maxLines = 1,
    this.maxLength,
    this.keyboardType,
  });

  final String label;
  final TextEditingController controller;
  final String hint;
  final int maxLines;
  final int? maxLength;
  final TextInputType? keyboardType;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTheme.manrope(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: AppColors.lightMuted,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          maxLines: maxLines,
          maxLength: maxLength,
          keyboardType: keyboardType,
          style: AppTheme.manrope(
            fontSize: 16,
            fontWeight: FontWeight.w500,
            color: AppColors.white,
          ),
          cursorColor: AppColors.accent,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: AppTheme.manrope(color: AppColors.lightMuted),
            filled: true,
            fillColor: AppColors.secondary,
            counterStyle: AppTheme.manrope(
              fontSize: 11,
              color: AppColors.lightMuted,
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 18,
              vertical: 16,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppRadius.sm),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppRadius.sm),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppRadius.sm),
              borderSide: const BorderSide(color: AppColors.accent, width: 1.5),
            ),
          ),
        ),
      ],
    );
  }
}

class _SelectChip extends StatelessWidget {
  const _SelectChip({
    required this.label,
    required this.selected,
    required this.trailing,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final IconData trailing;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
        decoration: BoxDecoration(
          color: selected ? AppColors.purple : AppColors.secondary,
          borderRadius: BorderRadius.circular(AppRadius.pill),
          border: Border.all(
            color: selected ? AppColors.purple : AppColors.border,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: AppTheme.manrope(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.white,
              ),
            ),
            const SizedBox(width: 6),
            Icon(trailing, size: 15, color: AppColors.white),
          ],
        ),
      ),
    );
  }
}
