import jsPDF from 'jspdf';

/**
 * Generate a perfectly formatted, thorough PDF itinerary
 * Each day starts on a new page
 */
export const generateItineraryPDF = (itineraryData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Helper function to add new page
  const addNewPage = () => {
    doc.addPage();
    yPosition = margin;
  };

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace = 20) => {
    if (yPosition + requiredSpace > pageHeight - margin - 15) {
      addNewPage();
      return true;
    }
    return false;
  };

  // Helper function to wrap text and return height used
  const addWrappedText = (text, x, y, maxWidth, fontSize = 10, color = [0, 0, 0], lineHeight = 1.2) => {
    if (!text) return 0;
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(String(text), maxWidth);
    const height = lines.length * (fontSize * lineHeight);
    doc.text(lines, x, y);
    return height;
  };

  // Helper function to add colored box
  const addColoredBox = (x, y, width, height, color) => {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(x, y, width, height, 2, 2, 'F');
  };

  // Helper function to add horizontal line
  const addLine = (x, y, width, color = [200, 200, 200]) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.5);
    doc.line(x, y, x + width, y);
  };

  // Cover Page - Header
  const headerHeight = 35;
  addColoredBox(0, 0, pageWidth, headerHeight, [70, 70, 70]);
  
  // Title
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  const title = itineraryData.title || `Trip to ${itineraryData.destination}`;
  const titleLines = doc.splitTextToSize(title, maxWidth);
  doc.text(titleLines, margin, 22);
  
  // Subtitle
  doc.setFontSize(12);
  doc.setTextColor(220, 220, 220);
  doc.setFont('helvetica', 'normal');
  doc.text(itineraryData.destination || 'Travel Itinerary', margin, 32);
  
  yPosition = headerHeight + 20;

  // Trip Information Box
  const infoBoxHeight = 40;
  addColoredBox(margin, yPosition, maxWidth, infoBoxHeight, [245, 245, 245]);
  
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'normal');
  
  let infoY = yPosition + 8;
  let infoLineHeight = 7;
  
  if (itineraryData.startDate && itineraryData.endDate) {
    const start = new Date(itineraryData.startDate);
    const end = new Date(itineraryData.endDate);
    doc.setFont('helvetica', 'bold');
    doc.text('Travel Dates:', margin + 5, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${start.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - ${end.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, margin + 45, infoY);
    infoY += infoLineHeight;
  }
  
  const days = itineraryData.itinerary?.days || itineraryData.days || [];
  doc.setFont('helvetica', 'bold');
  doc.text('Duration:', margin + 5, infoY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${days.length} ${days.length === 1 ? 'day' : 'days'}`, margin + 45, infoY);
  infoY += infoLineHeight;
  
  if (itineraryData.tripType) {
    doc.setFont('helvetica', 'bold');
    doc.text('Trip Type:', margin + 5, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text(itineraryData.tripType.charAt(0).toUpperCase() + itineraryData.tripType.slice(1), margin + 45, infoY);
    infoY += infoLineHeight;
  }

  if (itineraryData.budget) {
    doc.setFont('helvetica', 'bold');
    doc.text('Budget:', margin + 5, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text(itineraryData.budget.charAt(0).toUpperCase() + itineraryData.budget.slice(1), margin + 45, infoY);
  }
  
  yPosition += infoBoxHeight + 15;

  // Days - Each day on a new page
  days.forEach((day, dayIndex) => {
    // Start new page for each day (except first day)
    if (dayIndex > 0) {
      addNewPage();
    }
    
    // Day Header with grey color
    const dayHeaderHeight = 18;
    addColoredBox(margin, yPosition, maxWidth, dayHeaderHeight, [100, 100, 100]);
    
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    const dayTitle = `Day ${dayIndex + 1}: ${day.title || `Day ${dayIndex + 1}`}`;
    doc.text(dayTitle, margin + 8, yPosition + 12);
    yPosition += dayHeaderHeight + 10;

    // Day Description
    if (day.description) {
      checkPageBreak(20);
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'italic');
      const descHeight = addWrappedText(day.description, margin, yPosition, maxWidth, 11, [60, 60, 60], 1.4);
      yPosition += descHeight + 8;
      addLine(margin, yPosition, maxWidth);
      yPosition += 5;
    }

    // Activities Section
    if (day.activities && day.activities.length > 0) {
      checkPageBreak(25);
      
      // Section Header
      doc.setFontSize(13);
      doc.setTextColor(70, 70, 70);
      doc.setFont('helvetica', 'bold');
      doc.text('Activities', margin, yPosition);
      yPosition += 10;
      addLine(margin, yPosition, maxWidth, [220, 220, 220]);
      yPosition += 8;

      day.activities.forEach((activity, actIndex) => {
        checkPageBreak(35);
        
        // Activity card with border
        const cardPadding = 8;
        const cardY = yPosition - 2;
        const cardHeight = 30; // Will be adjusted
        
        // Card background
        addColoredBox(margin, cardY, maxWidth, cardHeight, [252, 252, 252]);
        
        // Card border
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, cardY, maxWidth, cardHeight, 3, 3);
        
        // Activity name
        doc.setFontSize(11);
        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'bold');
        const activityName = activity.name || 'Activity';
        doc.text(activityName, margin + cardPadding, yPosition + 5);
        
        // Time badge
        if (activity.time) {
          const badgeWidth = 50;
          const badgeHeight = 8;
          const badgeX = pageWidth - margin - badgeWidth - cardPadding;
          const badgeY = yPosition - 1;
          addColoredBox(badgeX, badgeY, badgeWidth, badgeHeight, [100, 100, 100]);
          doc.setFontSize(8);
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          const timeText = activity.time.length > 10 ? activity.time.substring(0, 10) : activity.time;
          doc.text(timeText, badgeX + 3, badgeY + 6);
        }
        
        yPosition += 8;
        
        // Activity description
        if (activity.description) {
          doc.setFontSize(9);
          doc.setTextColor(80, 80, 80);
          doc.setFont('helvetica', 'normal');
          const descHeight = addWrappedText(activity.description, margin + cardPadding, yPosition, maxWidth - (cardPadding * 2) - 55, 9, [80, 80, 80], 1.3);
          yPosition += descHeight + 3;
        }
        
        // Location
        if (activity.location) {
          doc.setFontSize(8);
          doc.setTextColor(120, 120, 120);
          doc.setFont('helvetica', 'normal');
          const locationText = `Location: ${activity.location}`;
          const locHeight = addWrappedText(locationText, margin + cardPadding, yPosition, maxWidth - (cardPadding * 2), 8, [120, 120, 120], 1.2);
          yPosition += locHeight + 2;
        }
        
        // Cost
        if (activity.cost) {
          doc.setFontSize(8);
          doc.setTextColor(34, 139, 34);
          doc.setFont('helvetica', 'bold');
          doc.text(`Cost: ${activity.cost}`, margin + cardPadding, yPosition);
          yPosition += 5;
        }
        
        // Rating if available
        if (activity.rating) {
          doc.setFontSize(8);
          doc.setTextColor(255, 165, 0);
          doc.setFont('helvetica', 'normal');
          doc.text(`Rating: ${activity.rating}/5`, margin + cardPadding, yPosition);
          yPosition += 5;
        }
        
        yPosition += 5; // Space between activities
        
        // Update card height if needed
        const actualCardHeight = yPosition - cardY;
        if (actualCardHeight > cardHeight) {
          // Redraw card with correct height
          addColoredBox(margin, cardY, maxWidth, actualCardHeight + 2, [252, 252, 252]);
          doc.roundedRect(margin, cardY, maxWidth, actualCardHeight + 2, 3, 3);
        }
      });
    }

    // Meals Section
    if (day.meals && day.meals.length > 0) {
      checkPageBreak(25);
      yPosition += 8;
      
      // Section Header
      doc.setFontSize(13);
      doc.setTextColor(70, 70, 70);
      doc.setFont('helvetica', 'bold');
      doc.text('Meals', margin, yPosition);
      yPosition += 10;
      addLine(margin, yPosition, maxWidth, [220, 220, 220]);
      yPosition += 8;

      day.meals.forEach((meal) => {
        checkPageBreak(30);
        
        // Meal card
        const cardPadding = 8;
        const cardY = yPosition - 2;
        const cardHeight = 25;
        
        // Card background
        addColoredBox(margin, cardY, maxWidth, cardHeight, [250, 250, 250]);
        
        // Card border
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, cardY, maxWidth, cardHeight, 3, 3);
        
        // Meal type and restaurant
        doc.setFontSize(11);
        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'bold');
        const mealText = `${meal.type}: ${meal.restaurant || 'Restaurant'}`;
        doc.text(mealText, margin + cardPadding, yPosition + 5);
        yPosition += 8;
        
        // Cuisine
        if (meal.cuisine) {
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.setFont('helvetica', 'normal');
          doc.text(`   Cuisine: ${meal.cuisine}`, margin + cardPadding, yPosition + 3);
          yPosition += 6;
        }
        
        // Location
        if (meal.location) {
          doc.setFontSize(8);
          doc.setTextColor(120, 120, 120);
          doc.setFont('helvetica', 'normal');
          const locationText = `   Location: ${meal.location}`;
          const locHeight = addWrappedText(locationText, margin + cardPadding, yPosition, maxWidth - (cardPadding * 2), 8, [120, 120, 120], 1.2);
          yPosition += locHeight + 2;
        }
        
        yPosition += 5; // Space between meals
      });
    }

    // Transportation
    if (day.transportation) {
      checkPageBreak(20);
      yPosition += 8;
      
      // Transportation box
      addColoredBox(margin, yPosition, maxWidth, 12, [240, 240, 240]);
      doc.setFontSize(10);
      doc.setTextColor(70, 70, 70);
      doc.setFont('helvetica', 'bold');
      doc.text(`Transportation: ${day.transportation}`, margin + 5, yPosition + 8);
      yPosition += 15;
    }

    // Day separator line
    if (dayIndex < days.length - 1) {
      checkPageBreak(10);
      addLine(margin, yPosition, maxWidth, [200, 200, 200]);
      yPosition += 5;
    }
  });

  // Travel Tips Section (on last page or new page if needed)
  const itinerary = itineraryData.itinerary || itineraryData;
  if (itinerary.tips && itinerary.tips.length > 0) {
    checkPageBreak(50);
    yPosition += 10;
    
    // Tips header
    addColoredBox(margin, yPosition, maxWidth, 12, [255, 240, 200]);
    doc.setFontSize(13);
    doc.setTextColor(200, 150, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Travel Tips', margin + 5, yPosition + 9);
    yPosition += 15;

    itinerary.tips.forEach((tip, index) => {
      checkPageBreak(20);
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');
      const tipText = `${index + 1}. ${tip}`;
      const tipHeight = addWrappedText(tipText, margin + 5, yPosition, maxWidth - 10, 10, [60, 60, 60], 1.4);
      yPosition += tipHeight + 4;
    });
  }

  // Total Cost Section
  if (itinerary.totalCost) {
    checkPageBreak(25);
    yPosition += 10;
    
    // Cost box
    addColoredBox(margin, yPosition, maxWidth, 18, [240, 255, 240]);
    doc.setDrawColor(200, 220, 200);
    doc.setLineWidth(1);
    doc.roundedRect(margin, yPosition, maxWidth, 18, 3, 3);
    
    doc.setFontSize(12);
    doc.setTextColor(34, 139, 34);
    doc.setFont('helvetica', 'bold');
    doc.text('Estimated Total Cost:', margin + 8, yPosition + 8);
    
    doc.setFontSize(18);
    doc.setTextColor(0, 150, 0);
    const costText = itinerary.totalCost;
    const costWidth = doc.getTextWidth(costText);
    doc.text(costText, pageWidth - margin - costWidth - 8, yPosition + 12);
  }

  // Add footer to all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    
    // Page number
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    
    // Document info
    doc.setFontSize(8);
    doc.text(
      `Generated on ${new Date().toLocaleDateString('en-IN')}`,
      margin,
      pageHeight - 10
    );
  }

  // Save the PDF
  const fileName = `${(itineraryData.destination || 'Itinerary').replace(/\s+/g, '_')}_Itinerary.pdf`;
  doc.save(fileName);
};

export default generateItineraryPDF;
