console.log('🧪 Testing Nigerian Timezone Configuration...\n');

// Test current time in Nigerian timezone
const nigeriaTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
console.log('🕐 Current Nigeria time:', nigeriaTime);

// Test timezone conversion
const utcTime = new Date();
console.log('\n🌍 UTC time:', utcTime);
console.log('🇳🇬 Converted to Nigeria time:', utcTime.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));

// Test date formatting
const formatForDisplay = (date) => {
  return date.toLocaleString('en-US', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

console.log('\n📅 Formatted for display:', formatForDisplay(new Date()));

// Test date range calculation
const getDateRange = (period = 'week') => {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
  const startDate = new Date(now);
  
  switch (period) {
    case 'day':
      startDate.setDate(now.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  return {
    startDate: startDate.toISOString(),
    endDate: now.toISOString()
  };
};

const weekRange = getDateRange('week');
console.log('\n📊 Week range for analytics:');
console.log('   Start:', weekRange.startDate);
console.log('   End:', weekRange.endDate);

console.log('\n✅ Timezone test completed!');
console.log('📝 All timestamps should now be in Nigerian timezone (UTC+1)'); 