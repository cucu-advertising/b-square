import 'package:flutter/material.dart';

import '../../models/connection_request.dart';
import '../../services/connection_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/glass_container.dart';
import '../profile/member_profile_screen.dart';

class SentRequestsScreen extends StatefulWidget {
  const SentRequestsScreen({super.key});

  @override
  State<SentRequestsScreen> createState() => _SentRequestsScreenState();
}

class _SentRequestsScreenState extends State<SentRequestsScreen> {
  final _connectionService = ConnectionService();

  List<ConnectionRequestItem> _requests = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final rows = await _connectionService.fetchSentRequests();
      if (!mounted) return;
      setState(() {
        _requests = rows;
        _loading = false;
      });
    } on ConnectionException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = 'Something went wrong: $e';
        _loading = false;
      });
    }
  }

  Future<void> _withdraw(ConnectionRequestItem request) async {
    final previous = _requests;
    setState(() {
      _requests = _requests.where((r) => r.id != request.id).toList();
    });
    try {
      await _connectionService.cancelRequest(request.id);
    } on ConnectionException catch (e) {
      if (!mounted) return;
      setState(() => _requests = previous);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(e.message)));
    } catch (e) {
      if (!mounted) return;
      setState(() => _requests = previous);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not withdraw request: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B1020),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'Sent Requests',
          style: AppTheme.manrope(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.white,
          ),
        ),
      ),
      body: RefreshIndicator(
        color: AppColors.purple,
        onRefresh: _load,
        child: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.purple),
      );
    }
    if (_error != null) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          const SizedBox(height: 80),
          Center(
            child: Text(
              _error!,
              style: AppTheme.manrope(color: AppColors.lightMuted),
            ),
          ),
        ],
      );
    }
    if (_requests.isEmpty) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          const SizedBox(height: 80),
          Center(
            child: Column(
              children: [
                const Icon(
                  Icons.outgoing_mail,
                  size: 40,
                  color: AppColors.lightMuted,
                ),
                const SizedBox(height: 12),
                Text(
                  'No sent requests',
                  style: AppTheme.manrope(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: AppColors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Requests you send will show up here.',
                  style: AppTheme.manrope(
                    fontSize: 13,
                    color: AppColors.lightMuted,
                  ),
                ),
              ],
            ),
          ),
        ],
      );
    }
    return ListView.separated(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
      itemCount: _requests.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final request = _requests[index];
        return _SentRequestCard(
          request: request,
          onWithdraw: () => _withdraw(request),
          onOpen: () {
            Navigator.of(context).push(
              MaterialPageRoute<void>(
                builder: (_) =>
                    MemberProfileScreen(userId: request.user.id),
              ),
            );
          },
        );
      },
    );
  }
}

class _SentRequestCard extends StatelessWidget {
  const _SentRequestCard({
    required this.request,
    required this.onWithdraw,
    required this.onOpen,
  });

  final ConnectionRequestItem request;
  final VoidCallback onWithdraw;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    final user = request.user;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.md),
        onTap: onOpen,
        child: GlassContainer(
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: const Color(0xFF1A2550),
                backgroundImage: user.profilePhotoUrl != null
                    ? NetworkImage(user.profilePhotoUrl!)
                    : null,
                child: user.profilePhotoUrl == null
                    ? Text(
                        user.name.isNotEmpty
                            ? user.name[0].toUpperCase()
                            : '?',
                        style: AppTheme.manrope(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: AppColors.white,
                        ),
                      )
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user.name,
                      style: AppTheme.manrope(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.white,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (user.roleCompany.isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Text(
                        user.roleCompany,
                        style: AppTheme.manrope(
                          fontSize: 13,
                          color: AppColors.mutedText,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    const SizedBox(height: 4),
                    Text(
                      'Pending',
                      style: AppTheme.manrope(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.purple,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              OutlinedButton(
                onPressed: onWithdraw,
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.lightMuted,
                  side: const BorderSide(color: Color(0xFF2E3858)),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppRadius.pill),
                  ),
                ),
                child: Text(
                  'Withdraw',
                  style: AppTheme.manrope(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
