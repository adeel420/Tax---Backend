// Generate meeting details with instructions
const generateSimpleMeetingLink = (appointment) => {
  try {
    // Create a meeting ID for reference
    const appointmentId = appointment._id ? appointment._id.toString().slice(-6) : Date.now().toString().slice(-6);
    const dateStr = new Date(appointment.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }).replace('/', '');
    const timeStr = appointment.timeSlot.replace(':', '');
    
    const meetingId = `TAX${dateStr}${timeStr}${appointmentId.toUpperCase()}`;
    
    // Admin will create the meeting and share the link
    const meetingInstructions = {
      meetingId,
      adminEmail: process.env.ADMIN_USER || 'admin@eliaselitaxservices.com',
      clientInstructions: 'Our admin will send you the Google Meet link 10 minutes before your appointment time.'
    };
    
    console.log(`Generated meeting ID for ${appointment.name}: ${meetingId}`);
    
    return meetingInstructions;
  } catch (error) {
    console.error('Error generating meeting details:', error);
    return {
      meetingId: `TAX${Date.now()}`,
      adminEmail: 'admin@eliaselitaxservices.com',
      clientInstructions: 'Our admin will send you the Google Meet link before your appointment.'
    };
  }
};

module.exports = {
  generateSimpleMeetingLink
};