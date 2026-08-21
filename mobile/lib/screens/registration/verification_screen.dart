import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/app_constants.dart';
import '../../providers/signup_flow_provider.dart';
import '../../widgets/onboarding/chip_selector.dart';
import '../../widgets/onboarding/onboarding_scaffold.dart';
import '../../widgets/onboarding/onboarding_text_field.dart';
import '../../constants/signup_flow_steps.dart';
import 'business_info_screen.dart';

class VerificationScreen extends StatefulWidget {
  const VerificationScreen({super.key});

  @override
  State<VerificationScreen> createState() => _VerificationScreenState();
}

class _VerificationScreenState extends State<VerificationScreen> {
  late VerificationType _type;
  late final TextEditingController _dinController;
  late final TextEditingController _dinNameController;
  late final TextEditingController _linkedinController;
  late final TextEditingController _successionNoteController;
  late final TextEditingController _prevDinController;
  late final TextEditingController _newDinController;
  String? _error;

  @override
  void initState() {
    super.initState();
    final data = context.read<SignupFlowProvider>().data;
    _type = data.verificationType;
    _dinController = TextEditingController(text: data.dinNumber);
    _dinNameController = TextEditingController(text: data.dinDirectorName);
    _linkedinController = TextEditingController(text: data.linkedinUrl);
    _successionNoteController =
        TextEditingController(text: data.successionDocNote);
    _prevDinController = TextEditingController(text: data.successionPrevDin);
    _newDinController = TextEditingController(text: data.successionNewDin);
  }

  @override
  void dispose() {
    _dinController.dispose();
    _dinNameController.dispose();
    _linkedinController.dispose();
    _successionNoteController.dispose();
    _prevDinController.dispose();
    _newDinController.dispose();
    super.dispose();
  }

  bool _validate() {
    switch (_type) {
      case VerificationType.din:
        if (_dinController.text.trim().isEmpty ||
            _dinNameController.text.trim().isEmpty) {
          _error = 'DIN number and director name are required';
          return false;
        }
        if (!RegExp(r'^\d{8}$').hasMatch(_dinController.text.trim())) {
          _error = 'DIN must be 8 digits';
          return false;
        }
      case VerificationType.linkedin:
        if (_linkedinController.text.trim().isEmpty) {
          _error = 'LinkedIn profile URL is required';
          return false;
        }
        if (!_linkedinController.text.toLowerCase().contains('linkedin.com/in/')) {
          _error = 'Enter a valid LinkedIn profile URL';
          return false;
        }
      case VerificationType.succession:
        if (_successionNoteController.text.trim().isEmpty) {
          _error = 'Succession document details are required';
          return false;
        }
    }
    _error = null;
    return true;
  }

  void _continue() {
    if (!_validate()) {
      setState(() {});
      return;
    }

    final provider = context.read<SignupFlowProvider>();
    provider.update(() {
      provider.data.verificationType = _type;
      provider.data.dinNumber = _dinController.text.trim();
      provider.data.dinDirectorName = _dinNameController.text.trim();
      provider.data.linkedinUrl = _linkedinController.text.trim();
      provider.data.successionDocNote = _successionNoteController.text.trim();
      provider.data.successionPrevDin = _prevDinController.text.trim();
      provider.data.successionNewDin = _newDinController.text.trim();
    });

    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const BusinessInfoScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return OnboardingScaffold(
      title: 'Identity verification',
      subtitle: 'All methods require manual admin review before access is granted.',
      progressSegments: SignupFlowSteps.total,
      activeSegment: SignupFlowSteps.segmentIndex(SignupFlowSteps.verification),
      onBack: () => Navigator.of(context).pop(),
      onNext: _continue,
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            GoalOptionCard(
              title: 'DIN — Director ID Number',
              subtitle:
                  'For MCA-registered directors. Submit your 8-digit DIN and name exactly as on the MCA portal.',
              selected: _type == VerificationType.din,
              onTap: () => setState(() => _type = VerificationType.din),
            ),
            GoalOptionCard(
              title: 'Business Succession',
              subtitle:
                  'Inherited a family business? Submit predecessor DIN and succession documents.',
              selected: _type == VerificationType.succession,
              onTap: () => setState(() => _type = VerificationType.succession),
            ),
            GoalOptionCard(
              title: 'LinkedIn Profile',
              subtitle:
                  'Verify your professional identity using your LinkedIn profile URL.',
              selected: _type == VerificationType.linkedin,
              onTap: () => setState(() => _type = VerificationType.linkedin),
            ),
            const SizedBox(height: 20),
            if (_type == VerificationType.din) ...[
              OnboardingTextField(
                label: 'DIN Number *',
                controller: _dinController,
                hint: '8-digit DIN',
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 16),
              OnboardingTextField(
                label: 'Director Name *',
                controller: _dinNameController,
                hint: 'As on MCA portal',
              ),
            ] else if (_type == VerificationType.linkedin) ...[
              OnboardingTextField(
                label: 'LinkedIn URL *',
                controller: _linkedinController,
                hint: 'https://linkedin.com/in/your-profile',
                keyboardType: TextInputType.url,
              ),
            ] else ...[
              OnboardingTextField(
                label: 'Previous DIN',
                controller: _prevDinController,
                hint: 'Optional',
              ),
              const SizedBox(height: 16),
              OnboardingTextField(
                label: 'New DIN',
                controller: _newDinController,
                hint: 'Optional',
              ),
              const SizedBox(height: 16),
              OnboardingTextField(
                label: 'Succession Details *',
                controller: _successionNoteController,
                hint: 'Describe succession documents submitted',
                maxLines: 3,
              ),
            ],
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(
                _error!,
                style: const TextStyle(color: Colors.red, fontSize: 13),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

