// @ts-nocheck
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../db/connection.js';
import { logger } from '../utils/logger.js';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

// Import Models
import { City } from '../models/City.js';
import { Zone } from '../models/Zone.js';
import { Ward } from '../models/Ward.js';
import { Contractor } from '../models/Contractor.js';
import { ContractorZone } from '../models/ContractorZone.js';
import { Shift } from '../models/Shift.js';
import { Worker } from '../models/Worker.js';
import { User } from '../models/User.js';
import { CollectionPoint } from '../models/CollectionPoint.js';
import { TransferStation } from '../models/TransferStation.js';
import { Vehicle } from '../models/Vehicle.js';
import { VehicleMaintenance } from '../models/VehicleMaintenance.js';
import { Route } from '../models/Route.js';
import { RouteStop } from '../models/RouteStop.js';
import { CollectionOperation } from '../models/CollectionOperation.js';
import { CollectionEvent } from '../models/CollectionEvent.js';
import { WorkOrder } from '../models/WorkOrder.js';
import { Complaint } from '../models/Complaint.js';
import { Inspection } from '../models/Inspection.js';
import { Alert } from '../models/Alert.js';
import { AuditLog } from '../models/AuditLog.js';
import { TimelineEvent } from '../models/TimelineEvent.js';
import { Sequence } from '../models/Sequence.js';
import { SystemConfig } from '../models/SystemConfig.js';

async function clearCollections() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    if (collections[key]) {
      await collections[key].deleteMany({});
    }
  }
  logger.info('Cleared application collections.');
}

async function seedData() {
  try {
    await connectDB();
    logger.info('Starting database seeding...');
    
    // Clear only application collections
    await clearCollections();
    
    const passwordHash = await bcrypt.hash('Demo@1234', 10);

    // 1. Demo City
    const city = await City.create({
      code: 'DEMO-CITY',
      name: 'Gandhinagar Municipal Operations Demo',
      state: 'Gujarat',
      country: 'India',
      center: { lat: 23.2156, lng: 72.6369 },
      isActive: true,
    });
    logger.info('Created City.');

    // 2. Geographic hierarchy (Zones & Wards)
    const zones = [];
    for (let i = 1; i <= 5; i++) {
      zones.push({
        code: `Z-0${i}`,
        name: `Zone ${i}`,
        cityId: city._id,
        center: { lat: 23.2156 + i * 0.01, lng: 72.6369 + i * 0.01 },
        isActive: true,
      });
    }
    const createdZones = await Zone.insertMany(zones);
    logger.info('Created 5 Zones.');

    const showcaseZone = createdZones.find(z => z.code === 'Z-04')!;

    const wards = [];
    let wardCounter = 1;
    for (const zone of createdZones) {
      for (let j = 1; j <= 3; j++) {
        wards.push({
          code: `W-${String(wardCounter).padStart(3, '0')}`,
          number: wardCounter,
          name: `Ward ${wardCounter}`,
          zoneId: zone._id,
          isActive: true,
        });
        wardCounter++;
      }
    }
    const createdWards = await Ward.insertMany(wards);
    logger.info('Created 15 Wards.');

    const showcaseWards = createdWards.filter(w => w.zoneId.equals(showcaseZone._id));

    // 3. Showcase Contractors
    const contractors = [
      {
        code: 'ABC Waste Services',
        name: 'ABC Waste Services',
        contactPerson: 'Jane Doe',
        phone: '+919876543210',
        email: 'contact@abcwaste.com',
        contractRef: 'CNT-2023-001',
        contractStart: new Date('2023-01-01'),
        contractEnd: new Date('2025-12-31'),
        contractStatus: 'ACTIVE',
      },
      {
        code: 'Green City Cleaners',
        name: 'Green City Cleaners',
        contactPerson: 'Rahul Sharma',
        phone: '+919876543212',
        email: 'info@greencity.com',
        contractRef: 'CNT-2023-002',
        contractStart: new Date('2023-02-01'),
        contractEnd: new Date('2025-12-31'),
        contractStatus: 'ACTIVE',
      },
      {
        code: 'Eco Solutions Ltd',
        name: 'Eco Solutions Ltd',
        contactPerson: 'Anita Desai',
        phone: '+919876543213',
        email: 'support@ecosolutions.com',
        contractRef: 'CNT-2023-003',
        contractStart: new Date('2023-03-01'),
        contractEnd: new Date('2025-12-31'),
        contractStatus: 'ACTIVE',
      }
    ];
    
    const createdContractors = await Contractor.insertMany(contractors);
    const contractor = createdContractors[0];
    
    await ContractorZone.create([
      {
        contractorId: createdContractors[0]._id,
        zoneId: showcaseZone._id,
        contractStart: new Date('2023-01-01'),
        contractEnd: new Date('2025-12-31'),
        isActive: true
      },
      {
        contractorId: createdContractors[1]._id,
        zoneId: createdZones[0]._id,
        contractStart: new Date('2023-02-01'),
        contractEnd: new Date('2025-12-31'),
        isActive: true
      }
    ]);
    logger.info('Created Showcase Contractor.');

    // Shifts
    const shift = await Shift.create({
      name: 'Morning Shift',
      startTime: '06:00',
      endTime: '14:00',
      isActive: true
    });

    // 6. Showcase Driver & Workers
    const driver = await Worker.create({
      code: 'DRV-102',
      name: 'Ramesh Patel',
      workerRole: 'DRIVER',
      employerType: 'CONTRACTOR',
      contractorId: contractor._id,
      zoneId: showcaseZone._id,
      defaultShiftId: shift._id,
      status: 'ACTIVE',
      phone: '+919876543211',
      licenceNo: 'GJ01-2015-1234567',
      licenceExpiry: new Date('2028-05-15')
    });

    const crewMembers = [];
    for(let i = 1; i <= 3; i++) {
      crewMembers.push({
        code: `WRK-20${i}`,
        name: `Helper ${i}`,
        workerRole: 'SANITATION_WORKER',
        employerType: 'CONTRACTOR',
        contractorId: contractor._id,
        zoneId: showcaseZone._id,
        defaultShiftId: shift._id,
        status: 'ACTIVE'
      });
    }
    const createdCrew = await Worker.insertMany(crewMembers);

    // 5 & 7 & 11. Vehicles
    const vehicle1 = await Vehicle.create({
      code: 'VEH-0241',
      registrationNo: 'GJ-01-XX-0241',
      vehicleType: 'COMPACTOR',
      ownership: 'CONTRACTOR',
      contractorId: contractor._id,
      zoneId: showcaseZone._id,
      capacityTonnes: 5,
      status: 'BREAKDOWN', // Starts as breakdown for the scenario
      fuelType: 'DIESEL',
      insuranceExpiry: new Date('2025-01-01'),
      fitnessExpiry: new Date('2025-01-01')
    });

    const vehicle2 = await Vehicle.create({
      code: 'VEH-0244',
      registrationNo: 'GJ-01-XX-0244',
      vehicleType: 'COMPACTOR',
      ownership: 'CONTRACTOR',
      contractorId: contractor._id,
      zoneId: showcaseZone._id,
      capacityTonnes: 5,
      status: 'AVAILABLE',
      fuelType: 'DIESEL',
      insuranceExpiry: new Date('2025-01-01'),
      fitnessExpiry: new Date('2025-01-01')
    });
    
    // Additional vehicles
    await Vehicle.create({
      code: 'VEH-0245',
      registrationNo: 'GJ-01-XX-0245',
      vehicleType: 'MINI_TRUCK',
      ownership: 'CONTRACTOR',
      contractorId: contractor._id,
      zoneId: showcaseZone._id,
      capacityTonnes: 2,
      status: 'UNDER_MAINTENANCE',
      fuelType: 'CNG'
    });
    
    await Vehicle.create({
      code: 'VEH-0246',
      registrationNo: 'GJ-01-XX-0246',
      vehicleType: 'MINI_TRUCK',
      ownership: 'CONTRACTOR',
      contractorId: contractor._id,
      zoneId: showcaseZone._id,
      capacityTonnes: 2,
      status: 'UNAVAILABLE',
      fuelType: 'CNG',
      insuranceExpiry: new Date('2020-01-01') // Expired insurance
    });

    logger.info('Created Showcase Vehicles and Driver.');

    // Collection Points for Route (Rectangular grid mimicking Gandhinagar roads)
    const points = [];
    let currentLat = 23.2180;
    let currentLng = 72.6330;
    
    for(let i = 1; i <= 32; i++) {
      const pCode = `CP-${String(100 + i)}`; // CP-101 to CP-132
      
      // Move in a rectangular path aligned with Gandhinagar's diagonal grid
      if (i <= 8) {
        // Move South-East (along main road)
        currentLat -= 0.0005;
        currentLng += 0.0005;
      } else if (i <= 16) {
        // Turn right, move South-West (along sector road)
        currentLat -= 0.0005;
        currentLng -= 0.0005;
      } else if (i <= 24) {
        // Turn right, move North-West (along inner road)
        currentLat += 0.0005;
        currentLng -= 0.0005;
      } else {
        // Turn right, move North-East (back towards start)
        currentLat += 0.0005;
        currentLng += 0.0005;
      }

      points.push({
        code: pCode,
        name: `Bin ${pCode}`,
        assetType: 'COMMUNITY_POINT',
        wasteType: 'MIXED',
        zoneId: showcaseZone._id,
        wardId: showcaseWards[0]._id, // Put all in first ward of zone 4
        address: `Sector 10/11 Route, Point ${i}`,
        lat: currentLat,
        lng: currentLng,
        location: {
          type: 'Point',
          coordinates: [currentLng, currentLat]
        },
        capacityLitres: 1100,
        condition: pCode === 'CP-118' ? 'DAMAGED' : 'GOOD',
        lifecycleStatus: pCode === 'CP-118' ? 'UNDER_MAINTENANCE' : 'ACTIVE',
        registeredAt: new Date('2023-01-01')
      });
    }
    const createdPoints = await CollectionPoint.insertMany(points);
    
    const cp104 = createdPoints.find(p => p.code === 'CP-104')!;
    const cp118 = createdPoints.find(p => p.code === 'CP-118')!;

    // 4. Showcase Route
    const route = await Route.create({
      code: 'R-402',
      name: 'Zone 4 Main Route',
      zoneId: showcaseZone._id,
      primaryWardId: showcaseWards[0]._id,
      shiftId: shift._id,
      contractorId: contractor._id,
      plannedStartTime: '06:00',
      plannedEndTime: '14:00',
      operatingDays: [0, 1, 2, 3, 4, 5, 6],
      isActive: true
    });

    const routeStops = createdPoints.map((point, index) => ({
      routeId: route._id,
      collectionPointId: point._id,
      sequence: index + 1
    }));
    await RouteStop.insertMany(routeStops);
    logger.info('Created Showcase Route & Points.');

    // 15. Users
    const users = [
      {
        email: 'admin@demo.com',
        name: 'System Admin',
        passwordHash,
        role: 'ADMIN',
        isActive: true
      },
      {
        email: 'ops@demo.com',
        name: 'Operations Manager',
        passwordHash,
        role: 'OPS_MANAGER',
        isActive: true
      },
      {
        email: 'driver102@demo.com',
        name: 'Ramesh Patel',
        passwordHash,
        role: 'FIELD_WORKER',
        workerId: driver._id,
        zoneId: showcaseZone._id,
        isActive: true
      },
      {
        email: 'abcwaste@demo.com',
        name: 'ABC Waste Contractor',
        passwordHash,
        role: 'CONTRACTOR',
        contractorId: contractor._id,
        isActive: true
      }
    ];

    // Zone Supervisors
    for (const zone of createdZones) {
      users.push({
        email: `supervisor_${zone.code.toLowerCase()}@demo.com`,
        name: `Supervisor ${zone.code}`,
        passwordHash,
        role: 'ZONE_SUPERVISOR',
        zoneId: zone._id,
        isActive: true
      } as any);
    }
    const createdUsers = await User.insertMany(users);
    logger.info('Created Demo Users.');

    // 8. Complaint Scenario (CP-104)
    const complaintWo = await WorkOrder.create({
      code: 'WO-2024-001',
      title: 'Cleanup Missed Collection',
      type: 'CLEANUP',
      sourceType: 'COMPLAINT',
      priority: 'HIGH',
      status: 'CLOSED',
      zoneId: showcaseZone._id,
      routeId: route._id,
      collectionPointId: cp104._id,
      contractorId: contractor._id,
      createdById: createdUsers[0]._id,
      description: 'Missed collection cleanup at CP-104',
      dueAt: new Date(),
      verificationResult: 'PASSED',
      verifiedById: createdUsers[0]._id, // pseudo verified by admin
      verifiedAt: new Date()
    });

    const dummyComplaints = [
      {
        code: 'CMP-2024-001',
        category: 'MISSED_COLLECTION',
        channel: 'APP',
        citizenName: 'John Doe',
        status: 'CLOSED',
        priority: 'HIGH',
        zoneId: showcaseZone._id,
        wardId: showcaseWards[0]._id,
        collectionPointId: cp104._id,
        routeId: route._id,
        contractorId: createdContractors[0]._id,
        workOrderId: complaintWo._id,
        description: 'Bin not cleared today, garbage spreading on the street.',
        imageUrl: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=400&q=80',
        reportedAt: new Date(Date.now() - 24*60*60*1000), // yesterday
        dueAt: new Date(),
        closedAt: new Date()
      },
      {
        code: 'CMP-2024-002',
        category: 'OVERFLOWING_POINT',
        channel: 'WEB',
        citizenName: 'Priya Sharma',
        status: 'OPEN',
        priority: 'MEDIUM',
        zoneId: showcaseZone._id,
        wardId: showcaseWards[0]._id,
        contractorId: createdContractors[0]._id,
        description: 'The bin near the park is completely overflowing since yesterday.',
        imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=400&q=80',
        reportedAt: new Date(Date.now() - 2*60*60*1000), // 2 hours ago
        dueAt: new Date(Date.now() + 22*60*60*1000),
      },
      {
        code: 'CMP-2024-003',
        category: 'DAMAGED_BIN',
        channel: 'APP',
        citizenName: 'Vikram Singh',
        status: 'IN_PROGRESS',
        priority: 'LOW',
        zoneId: createdZones[0]._id,
        wardId: createdWards[0]._id,
        contractorId: createdContractors[1]._id,
        description: 'Bin lid is completely broken and emitting bad smell.',
        imageUrl: 'https://images.unsplash.com/photo-1611288875796-b3c9fa277ed2?auto=format&fit=crop&w=400&q=80',
        reportedAt: new Date(Date.now() - 48*60*60*1000), // 2 days ago
        dueAt: new Date(Date.now() - 1*60*60*1000),
      },
      {
        code: 'CMP-2024-004',
        category: 'ILLEGAL_DUMPING',
        channel: 'PHONE',
        citizenName: 'Anonymous',
        status: 'OPEN',
        priority: 'HIGH',
        zoneId: showcaseZone._id,
        wardId: showcaseWards[1]._id,
        contractorId: createdContractors[0]._id,
        description: 'Construction debris dumped illegally on the pavement.',
        imageUrl: 'https://images.unsplash.com/photo-1605810731666-8343110292c3?auto=format&fit=crop&w=400&q=80',
        reportedAt: new Date(Date.now() - 5*60*60*1000), // 5 hours ago
        dueAt: new Date(Date.now() + 19*60*60*1000),
      },
      {
        code: 'CMP-2024-005',
        category: 'WASTE_NOT_CLEARED',
        channel: 'APP',
        citizenName: 'Meera Patel',
        status: 'ASSIGNED',
        priority: 'MEDIUM',
        zoneId: createdZones[0]._id,
        wardId: createdWards[1]._id,
        contractorId: createdContractors[1]._id,
        description: 'Garbage collector skipped our street entirely today.',
        reportedAt: new Date(Date.now() - 12*60*60*1000), // 12 hours ago
        dueAt: new Date(Date.now() + 12*60*60*1000),
      }
    ];
    
    const createdComplaints = await Complaint.insertMany(dummyComplaints);
    const complaint = createdComplaints[0];
    
    // update WO with complaint ID
    complaintWo.complaintIds = [complaint._id];
    await complaintWo.save();

    // 9. Damaged point scenario (CP-118)
    const inspection = await Inspection.create({
      code: 'INS-2024-001',
      targetType: 'COLLECTION_POINT',
      targetId: cp118._id,
      zoneId: showcaseZone._id,
      status: 'COMPLETED',
      result: 'FAIL',
      condition: 'DAMAGED',
      inspectorId: createdUsers[0]._id,
      findings: 'Bin wheels broken, structure damaged.'
    });

    await WorkOrder.create({
      code: 'WO-2024-002',
      title: 'Repair Damaged Bin',
      type: 'ASSET_REPAIR',
      sourceType: 'INSPECTION',
      priority: 'HIGH',
      status: 'ASSIGNED',
      zoneId: showcaseZone._id,
      collectionPointId: cp118._id,
      inspectionId: inspection._id,
      assignedWorkerId: driver._id, // Assign to someone
      createdById: createdUsers[0]._id,
      description: 'Repair damaged bin wheels',
      dueAt: new Date(Date.now() + 86400000), // tomorrow
    });

    // 10. Vehicle Breakdown & Today's Operation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const operation = await CollectionOperation.create({
      code: `OP-${route.code}-${today.toISOString().split('T')[0]}`,
      routeId: route._id,
      date: today,
      shiftId: shift._id,
      vehicleId: vehicle2._id, // the replacement vehicle!
      driverId: driver._id,
      status: 'IN_PROGRESS',
      totalStops: 32,
      collectedCount: 10,
      missedCount: 1, // Let's say 1 missed
      issueCount: 0
    });

    // We simulate that VEH-0241 started the route, broke down, and VEH-0244 took over.
    // However, the operation currently references vehicle2. 
    // To strictly model this, we'd have a timeline event.
    
    const maint = await VehicleMaintenance.create({
      code: 'MNT-2024-001',
      vehicleId: vehicle1._id,
      type: 'REPAIR',
      status: 'REPORTED',
      priority: 'CRITICAL',
      reportedAt: new Date(),
      reportedById: createdUsers[0]._id,
      issue: 'Engine stall on route'
    });

    const vehicle245 = await Vehicle.findOne({ code: 'VEH-0245' });
    if (vehicle245) {
      await VehicleMaintenance.create({
        code: 'MNT-2024-002',
        vehicleId: vehicle245._id,
        type: 'ROUTINE_SERVICE',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        reportedAt: new Date(),
        reportedById: createdUsers[0]._id,
        issue: 'Scheduled maintenance'
      });
    }

    await Alert.create({
      type: 'VEHICLE_BREAKDOWN',
      severity: 'CRITICAL',
      status: 'ACTIVE',
      entityType: 'VEHICLE',
      entityId: vehicle1._id,
      zoneId: showcaseZone._id,
      contractorId: contractor._id,
      title: 'Vehicle Breakdown on R-402',
      message: `Vehicle ${vehicle1.code} reported breakdown while on route.`,
      dedupeKey: `BREAKDOWN-${vehicle1._id}-${Date.now()}`,
      raisedAt: new Date()
    });
    
    // Seed an alert for the missed collection on today's route just in case
    await Alert.create({
      type: 'MISSED_COLLECTION',
      severity: 'WARNING',
      status: 'ACTIVE',
      entityType: 'COLLECTION_OPERATION',
      entityId: operation._id,
      zoneId: showcaseZone._id,
      title: 'Missed Collection Detected',
      message: 'A stop was missed on route R-402.',
      dedupeKey: `MISSED-${operation._id}`,
      raisedAt: new Date()
    });
    
    // Create an un-resolved event for the missed stop to satisfy I12
    const missedEvent = await CollectionEvent.create({
      operationId: operation._id,
      collectionPointId: createdPoints[0]._id, // first stop missed
      sequence: 1,
      status: 'MISSED',
      notes: 'Road blocked'
    });

    const collectedEvents = [];
    for (let i = 1; i <= 10; i++) {
      collectedEvents.push({
        operationId: operation._id,
        collectionPointId: createdPoints[i]._id,
        sequence: i + 1,
        status: 'COLLECTED',
        collectedAt: new Date()
      });
    }
    await CollectionEvent.insertMany(collectedEvents);

    // 13, 14, 16, 17 - Audit & Timeline examples
    await TimelineEvent.create({
      entityType: 'VEHICLE',
      entityId: vehicle1._id,
      eventType: 'VEHICLE_BREAKDOWN',
      title: 'Vehicle broke down',
      occurredAt: new Date()
    });

    await TimelineEvent.create({
      entityType: 'COLLECTION_OPERATION',
      entityId: operation._id,
      eventType: 'VEHICLE_REPLACED',
      title: 'Vehicle replaced',
      detail: `Replaced ${vehicle1.code} with ${vehicle2.code}`,
      occurredAt: new Date()
    });

    await AuditLog.create({
      actorName: 'System',
      action: 'CREATE',
      entityType: 'COLLECTION_OPERATION',
      entityId: operation._id,
      entityCode: operation.code,
      summary: 'Operation started'
    } as any);
    
    // Print demo accounts
    console.log('\n=========================================');
    console.log('Demo Environment Seeded successfully!');
    console.log('Login Accounts (Password: Demo@1234):');
    users.forEach(u => console.log(`- ${u.role}: ${u.email}`));
    console.log('=========================================\n');

    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

seedData();
