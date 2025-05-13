import 'package:flutter/material.dart';
import 'package:percent_indicator/linear_percent_indicator.dart';
import '../models/commute.dart';
import '../utils/theme.dart';

class CommuteCard extends StatelessWidget {
  final CommuteLog commuteLog;
  final VoidCallback? onTap;

  const CommuteCard({
    Key? key,
    required this.commuteLog,
    this.onTap,
  }) : super(key: key);

  String _getCommuteIcon(String type) {
    switch (type) {
      case 'walk':
        return 'directions_walk';
      case 'cycle':
        return 'directions_bike';
      case 'public_transport':
        return 'train';
      case 'carpool':
        return 'people';
      case 'electric_vehicle':
        return 'electric_car';
      case 'gas_vehicle':
        return 'directions_car';
      case 'remote_work':
        return 'home';
      default:
        return 'directions_walk';
    }
  }

  String _getCommuteTypeLabel(String type) {
    switch (type) {
      case 'walk':
        return 'Walking';
      case 'cycle':
        return 'Cycling';
      case 'public_transport':
        return 'Public Transport';
      case 'carpool':
        return 'Carpooling';
      case 'electric_vehicle':
        return 'Electric Vehicle';
      case 'gas_vehicle':
        return 'Gas Vehicle';
      case 'remote_work':
        return 'Remote Work';
      default:
        return 'Unknown';
    }
  }

  Color _getCommuteColor(String type) {
    return AppColors.commuteColors[type] ?? AppColors.primary;
  }

  @override
  Widget build(BuildContext context) {
    final commuteColor = _getCommuteColor(commuteLog.commuteType);
    final commuteIcon = _getCommuteIcon(commuteLog.commuteType);
    final commuteType = _getCommuteTypeLabel(commuteLog.commuteType);
    
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 0),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: commuteColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      IconData(
                        commuteIcon.codePointAt(0)!,
                        fontFamily: 'MaterialIcons',
                      ),
                      color: commuteColor,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          commuteType,
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${commuteLog.daysLogged} days • ${commuteLog.distanceKm.toStringAsFixed(1)} km',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '${commuteLog.co2SavedKg.toStringAsFixed(1)} kg',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              color: AppColors.secondary,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'CO₂ saved',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),
              LinearPercentIndicator(
                percent: commuteLog.daysLogged / 5,
                progressColor: commuteColor,
                backgroundColor: commuteColor.withOpacity(0.1),
                lineHeight: 8,
                padding: EdgeInsets.zero,
                barRadius: const Radius.circular(4),
                animation: true,
                animationDuration: 500,
              ),
            ],
          ),
        ),
      ),
    );
  }
}