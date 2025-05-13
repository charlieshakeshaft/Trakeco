import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../utils/theme.dart';

class TrakBottomNavigation extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const TrakBottomNavigation({
    Key? key,
    required this.currentIndex,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final isAdmin = authProvider.isAdmin;

    return BottomNavigationBar(
      currentIndex: currentIndex,
      onTap: onTap,
      type: BottomNavigationBarType.fixed,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: AppColors.textSecondary,
      showUnselectedLabels: true,
      items: [
        const BottomNavigationBarItem(
          icon: Icon(Icons.dashboard),
          label: 'Dashboard',
        ),
        const BottomNavigationBarItem(
          icon: Icon(Icons.directions_bike),
          label: 'Commute',
        ),
        const BottomNavigationBarItem(
          icon: Icon(Icons.emoji_events),
          label: 'Challenges',
        ),
        const BottomNavigationBarItem(
          icon: Icon(Icons.redeem),
          label: 'Rewards',
        ),
        if (isAdmin)
          const BottomNavigationBarItem(
            icon: Icon(Icons.business),
            label: 'Company',
          ),
      ],
    );
  }
}