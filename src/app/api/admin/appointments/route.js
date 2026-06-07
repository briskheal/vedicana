import { NextResponse } from 'next/server';
import models from '../../../../models/index.js';

const { Appointment } = models;

export async function GET(request) {
  try {
    const appointments = await Appointment.findAll({
      order: [
        ['date', 'DESC'],
        ['timeSlot', 'ASC']
      ]
    });
    
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching admin appointments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
