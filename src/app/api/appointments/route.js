import { NextResponse } from 'next/server';
import models from '../../../models/index.js';

const { Appointment } = models;

export async function POST(request) {
  try {
    const { name, email, phone, topic, date, timeSlot, notes } = await request.json();

    // 1. Validation
    if (!name || !email || !phone || !topic || !date || !timeSlot) {
      return NextResponse.json({ error: 'All fields (Name, Email, Phone, Topic, Date, and Time Slot) are required.' }, { status: 400 });
    }

    // 2. Check for double-booking
    const existing = await Appointment.findOne({
      where: {
        date,
        timeSlot,
        status: 'confirmed'
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'This time slot is already booked. Please choose another date or time.' }, { status: 409 });
    }

    // 3. Create Appointment in DB
    const newAppointment = await Appointment.create({
      name,
      email,
      phone,
      topic,
      date,
      timeSlot,
      notes: notes || '',
      status: 'confirmed' // default auto-confirmed for easy logistics
    });

    return NextResponse.json({
      success: true,
      appointmentId: newAppointment.id,
      appointment: newAppointment
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
