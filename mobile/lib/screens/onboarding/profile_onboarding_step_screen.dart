import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/app_constants.dart';
import '../../constants/signup_flow_steps.dart';
import '../../providers/signup_flow_provider.dart';
import '../../services/auth_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/onboarding/chip_selector.dart';
import '../../widgets/onboarding/onboarding_dropdown_field.dart';
import '../../widgets/onboarding/onboarding_scaffold.dart';
import '../../widgets/onboarding/onboarding_text_field.dart';
import 'signup_great_start_screen.dart';

class ProfileOnboardingStepScreen extends StatefulWidget {
  const ProfileOnboardingStepScreen({super.key, required this.step});

  final int step;

  @override
  State<ProfileOnboardingStepScreen> createState() =>
      _ProfileOnboardingStepScreenState();
}

class _ProfileOnboardingStepScreenState
    extends State<ProfileOnboardingStepScreen> {
  final _authService = AuthService();

  late final TextEditingController _founderController;
  late final TextEditingController _companyController;
  late final TextEditingController _roleController;
  String _yearFounded = '';
  String _companySize = '';
  String _revenueRange = '';
  String _businessGoal = '';
  List<String> _lookingFor = [];
  List<String> _businessInterests = [];

  @override
  void initState() {
    super.initState();
    final data = context.read<SignupFlowProvider>().data;
    _founderController = TextEditingController(
      text: data.founderName.isEmpty ? data.fullName : data.founderName,
    );
    _companyController = TextEditingController(
      text: data.companyName.isEmpty ? data.businessName : data.companyName,
    );
    _roleController = TextEditingController(
      text: data.role.isNotEmpty
          ? data.role
          : (data.headline.trim() != "I'm a Member of BSquare"
                ? data.headline.trim()
                : ''),
    );
    _yearFounded = data.yearFounded;
    _companySize = data.companySize;
    _revenueRange = data.revenueRange;
    _businessGoal = data.businessGoal;
    _lookingFor = List.of(data.lookingFor);
    _businessInterests = List.of(data.businessInterests);
  }

  @override
  void dispose() {
    _founderController.dispose();
    _companyController.dispose();
    _roleController.dispose();
    super.dispose();
  }

  String get _title => switch (widget.step) {
    SignupFlowSteps.aboutYou => 'Tell us about yourself',
    SignupFlowSteps.businessGoals => 'Your business goals',
    SignupFlowSteps.connectWith => 'Who you want to connect with',
    _ => 'Business interests & details',
  };

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
      if (_businessInterests.contains(value)) {
        _businessInterests.remove(value);
      } else {
        _businessInterests.add(value);
      }
    });
  }

  void _persistToProvider() {
    final provider = context.read<SignupFlowProvider>();
    provider.update(() {
      provider.data.founderName = _founderController.text.trim();
      provider.data.companyName = _companyController.text.trim();
      final role = _roleController.text.trim();
      provider.data.role = role;
      if (role.isNotEmpty) {
        provider.data.headline = role;
      }
      provider.data.yearFounded = _yearFounded;
      provider.data.companySize = _companySize;
      provider.data.revenueRange = _revenueRange;
      provider.data.businessGoal = _businessGoal;
      provider.data.lookingFor = List.of(_lookingFor);
      provider.data.businessInterests = List.of(_businessInterests);
    });
  }

  Future<void> _next() async {
    _persistToProvider();

    if (widget.step < SignupFlowSteps.interests) {
      if (!mounted) return;
      await Navigator.of(context).push<void>(
        MaterialPageRoute<void>(
          builder: (_) => ProfileOnboardingStepScreen(step: widget.step + 1),
        ),
      );
      return;
    }

    final provider = context.read<SignupFlowProvider>();
    try {
      await provider.runAsync(() => _authService.register(provider.data));
      await provider.runAsync(() => _authService.saveOnboarding(provider.data));
      final user = await provider.runAsync(_authService.fetchCurrentUser);
      provider.applyUser(user);
      if (!mounted) return;
      await Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute<void>(builder: (_) => const SignupGreatStartScreen()),
        (_) => false,
      );
    } on AuthException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    return OnboardingScaffold(
      title: _title,
      subtitle: 'This helps us show you the most relevant connections nearby',
      progressSegments: SignupFlowSteps.total,
      activeSegment: SignupFlowSteps.segmentIndex(widget.step),
      onBack: () => Navigator.of(context).pop(),
      onNext: _next,
      child: SingleChildScrollView(
        child: switch (widget.step) {
          SignupFlowSteps.aboutYou => _AboutYouStep(
            founderController: _founderController,
            companyController: _companyController,
            roleController: _roleController,
            yearFounded: _yearFounded,
            companySize: _companySize,
            revenueRange: _revenueRange,
            onYearChanged: (value) => setState(() => _yearFounded = value),
            onSizeChanged: (value) => setState(() => _companySize = value),
            onRevenueChanged: (value) => setState(() => _revenueRange = value),
          ),
          SignupFlowSteps.businessGoals => _BusinessGoalsStep(
            businessGoal: _businessGoal,
            onSelect: (value) => setState(() => _businessGoal = value),
          ),
          SignupFlowSteps.connectWith => ChipSelector(
            options: AppConstants.connectWith,
            selected: _lookingFor,
            onToggle: _toggleLookingFor,
          ),
          _ => ChipSelector(
            options: AppConstants.interests,
            selected: _businessInterests,
            onToggle: _toggleInterest,
          ),
        },
      ),
    );
  }
}

class _AboutYouStep extends StatelessWidget {
  const _AboutYouStep({
    required this.founderController,
    required this.companyController,
    required this.roleController,
    required this.yearFounded,
    required this.companySize,
    required this.revenueRange,
    required this.onYearChanged,
    required this.onSizeChanged,
    required this.onRevenueChanged,
  });

  final TextEditingController founderController;
  final TextEditingController companyController;
  final TextEditingController roleController;
  final String yearFounded;
  final String companySize;
  final String revenueRange;
  final ValueChanged<String> onYearChanged;
  final ValueChanged<String> onSizeChanged;
  final ValueChanged<String> onRevenueChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        OnboardingTextField(
          label: 'Your Name (Founder / Director) *',
          controller: founderController,
          hint: 'e.g. Prathik Sharma',
        ),
        const SizedBox(height: 16),
        OnboardingTextField(
          label: 'Company Name',
          controller: companyController,
          hint: 'e.g. Ravi Textiles',
        ),
        const SizedBox(height: 16),
        OnboardingTextField(
          label: 'Role',
          controller: roleController,
          hint: 'e.g. Founder & CEO',
        ),
        const SizedBox(height: 16),
        _LabeledSection(
          label: 'Year Founded',
          child: OnboardingDropdownField(
            label: 'Year Founded',
            showLabel: false,
            value: yearFounded,
            hint: 'Select year founded',
            options: AppConstants.foundedYears,
            onChanged: (value) => onYearChanged(value ?? ''),
          ),
        ),
        const SizedBox(height: 16),
        _LabeledSection(
          label: 'Company Size',
          child: ChipSelector(
            options: AppConstants.companySizes,
            selected: companySize.isEmpty ? [] : [companySize],
            onToggle: (value) =>
                onSizeChanged(companySize == value ? '' : value),
          ),
        ),
        const SizedBox(height: 16),
        _LabeledSection(
          label: 'Annual Revenue Range',
          child: ChipSelector(
            options: AppConstants.revenueRanges,
            selected: revenueRange.isEmpty ? [] : [revenueRange],
            onToggle: (value) =>
                onRevenueChanged(revenueRange == value ? '' : value),
          ),
        ),
      ],
    );
  }
}

class _BusinessGoalsStep extends StatelessWidget {
  const _BusinessGoalsStep({
    required this.businessGoal,
    required this.onSelect,
  });

  final String businessGoal;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: AppConstants.businessGoals
          .map(
            (goal) => GoalOptionCard(
              title: goal.label,
              subtitle: goal.subtitle,
              selected: businessGoal == goal.value,
              onTap: () => onSelect(goal.value),
            ),
          )
          .toList(),
    );
  }
}

class _LabeledSection extends StatelessWidget {
  const _LabeledSection({required this.label, required this.child});

  final String label;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTheme.manrope(
            fontSize: 13,
            color: AppColors.lightMuted,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),
        child,
      ],
    );
  }
}
