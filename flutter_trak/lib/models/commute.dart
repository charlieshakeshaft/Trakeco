enum CommuteType {
  walk,
  cycle,
  publicTransport,
  carpool,
  electricVehicle,
  gasVehicle,
  remoteWork,
}

extension CommuteTypeExtension on CommuteType {
  String get value {
    switch (this) {
      case CommuteType.walk:
        return 'walk';
      case CommuteType.cycle:
        return 'cycle';
      case CommuteType.publicTransport:
        return 'public_transport';
      case CommuteType.carpool:
        return 'carpool';
      case CommuteType.electricVehicle:
        return 'electric_vehicle';
      case CommuteType.gasVehicle:
        return 'gas_vehicle';
      case CommuteType.remoteWork:
        return 'remote_work';
      default:
        return 'walk';
    }
  }

  String get label {
    switch (this) {
      case CommuteType.walk:
        return 'Walking';
      case CommuteType.cycle:
        return 'Cycling';
      case CommuteType.publicTransport:
        return 'Public Transport';
      case CommuteType.carpool:
        return 'Carpooling';
      case CommuteType.electricVehicle:
        return 'Electric Vehicle';
      case CommuteType.gasVehicle:
        return 'Gas Vehicle';
      case CommuteType.remoteWork:
        return 'Remote Work';
      default:
        return 'Walking';
    }
  }

  String get icon {
    switch (this) {
      case CommuteType.walk:
        return 'directions_walk';
      case CommuteType.cycle:
        return 'directions_bike';
      case CommuteType.publicTransport:
        return 'train';
      case CommuteType.carpool:
        return 'people';
      case CommuteType.electricVehicle:
        return 'electric_car';
      case CommuteType.gasVehicle:
        return 'directions_car';
      case CommuteType.remoteWork:
        return 'home';
      default:
        return 'directions_walk';
    }
  }

  int get pointsPerDay {
    switch (this) {
      case CommuteType.walk:
        return 30;
      case CommuteType.cycle:
        return 25;
      case CommuteType.publicTransport:
        return 20;
      case CommuteType.carpool:
        return 15;
      case CommuteType.electricVehicle:
        return 10;
      case CommuteType.gasVehicle:
        return 0;
      case CommuteType.remoteWork:
        return 20;
      default:
        return 0;
    }
  }
}

class CommuteLog {
  final int? id;
  final int userId;
  final String weekStart;
  final String commuteType;
  final int daysLogged;
  final double distanceKm;
  final double co2SavedKg;
  final String? createdAt;

  CommuteLog({
    this.id,
    required this.userId,
    required this.weekStart,
    required this.commuteType,
    required this.daysLogged,
    required this.distanceKm,
    required this.co2SavedKg,
    this.createdAt,
  });

  factory CommuteLog.fromJson(Map<String, dynamic> json) {
    return CommuteLog(
      id: json['id'],
      userId: json['user_id'],
      weekStart: json['week_start'],
      commuteType: json['commute_type'],
      daysLogged: json['days_logged'],
      distanceKm: (json['distance_km'] is int) 
          ? (json['distance_km'] as int).toDouble() 
          : json['distance_km'],
      co2SavedKg: (json['co2_saved_kg'] is int) 
          ? (json['co2_saved_kg'] as int).toDouble() 
          : json['co2_saved_kg'],
      createdAt: json['created_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'week_start': weekStart,
      'commute_type': commuteType,
      'days_logged': daysLogged,
      'distance_km': distanceKm,
      'co2_saved_kg': co2SavedKg,
    };
  }
}