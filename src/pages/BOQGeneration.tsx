import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Edit, Download, Printer, Check, X } from 'lucide-react';

import headerImage from '../assets/CHOICEDGE BOQ PDF Header.png';
import footerImage from '../assets/CHOICEDGE BOQ PDF Footer.png';
import watermarkImage from '../assets/CHOICEDGE BOQ PDF watermark logo.png';

// Format number in Indian number system (e.g., 10,00,000.00)
const formatIndianNumber = (num: number): string => {
  const parts = num.toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  let formattedInteger = '';
  
  // Format the integer part with commas for Indian number system
  const length = integerPart.length;
  if (length <= 3) {
    formattedInteger = integerPart;
  } else {
    const lastThree = integerPart.substring(length - 3);
    const otherNumbers = integerPart.substring(0, length - 3);
    formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + ',' + lastThree;
  }
  
  return `${formattedInteger}.${decimalPart}`;
};

interface BOQItem {
  id: number;
  description: string;
  specifications: string;
  materials: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  isEditing?: boolean;
  editedDescription?: string;
  editedSpecifications?: string;
  editedMaterials?: string;
  editedUnit?: string;
  editedQuantity?: string;
  editedRate?: string;
}

const tableInputStyle = "block w-full px-2 py-1 rounded bg-[#2a2a2a] border border-transparent text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#f1d49b]/50 focus:border-[#f1d49b]/80 transition duration-200 text-right text-sm";

export function BOQGeneration() {
  const navigate = useNavigate();
  const location = useLocation();
  const [boqItems, setBoqItems] = useState<BOQItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [boqGenerated, setBoqGenerated] = useState(false);
  const [originalItemData, setOriginalItemData] = useState<BOQItem | null>(null);
  
  // Project information editing states
  const [isEditingProjectInfo, setIsEditingProjectInfo] = useState(false);
  const [isEditingCostingDetails, setIsEditingCostingDetails] = useState(false);
  const [editedProjectDetails, setEditedProjectDetails] = useState<any>({});

  const projectType = localStorage.getItem('projectType');
  const projectDetails = JSON.parse(localStorage.getItem('projectDetails') || '{}');
  const selectedCategory = JSON.parse(localStorage.getItem('selectedCategory') || '{}');

  // Check if we're coming from image upload with extracted data
  const fromImageUpload = location.state?.fromImageUpload;
  
  useEffect(() => {
    // If coming from image upload, use the extracted data
    if (fromImageUpload) {
      const extractedItems = JSON.parse(localStorage.getItem('extractedBOQItems') || '[]');
      if (extractedItems.length > 0) {
        setBoqItems(extractedItems);
        const total = extractedItems.reduce((sum: number, item: BOQItem) => sum + item.amount, 0);
        setTotalAmount(total);
        setBoqGenerated(true);
        return;
      }
    }
    
    // Otherwise, proceed with normal flow
    if (!projectType || !projectDetails.carpetArea || !selectedCategory.type) {
      navigate('/category-selection');
      return;
    }
    if (!boqGenerated) {
      handleGenerateBOQ();
    }
    
    // Initialize edited project details
    setEditedProjectDetails({...projectDetails});
  }, [navigate, projectType, projectDetails, selectedCategory, boqGenerated, fromImageUpload]);
  
  // Handler functions for project information editing
  const handleSaveProjectInfo = () => {
    const updatedDetails = {
      ...projectDetails,
      clientName: editedProjectDetails.clientName,
      projectName: editedProjectDetails.projectName,
      location: editedProjectDetails.location
    };
    
    localStorage.setItem('projectDetails', JSON.stringify(updatedDetails));
    setIsEditingProjectInfo(false);
    window.location.reload(); // Reload to update all components with new project details
  };
  
  const handleCancelEditProjectInfo = () => {
    setEditedProjectDetails({...projectDetails});
    setIsEditingProjectInfo(false);
  };
  
  const handleSaveCostingDetails = () => {
    const updatedDetails = {
      ...projectDetails,
      carpetArea: parseFloat(editedProjectDetails.carpetArea) || projectDetails.carpetArea
    };
    
    localStorage.setItem('projectDetails', JSON.stringify(updatedDetails));
    setIsEditingCostingDetails(false);
    
    // Regenerate BOQ with new carpet area
    handleGenerateBOQ();
  };
  
  const handleCancelEditCostingDetails = () => {
    setEditedProjectDetails({...projectDetails});
    setIsEditingCostingDetails(false);
  };

  const handleGenerateBOQ = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const { items, totalCost } = calculateBOQItems();
      setBoqItems(items);
      setTotalAmount(totalCost);
      setBoqGenerated(true);
      setIsGenerating(false);
    }, 800);
  };

  const calculateBOQItems = () => {
    const carpetArea = parseFloat(projectDetails.carpetArea) || 0;
    const projectTypeKey = projectType?.toLowerCase() || 'residential';
    const categoryType = selectedCategory.type;
    const items: BOQItem[] = [];
    let totalCost = 0;
    let itemId = 1;

    if (projectTypeKey === 'residential') {
      const shoeRackSpecs = categoryType === 'standard' ?
        { specs: 'MDF 18mm top, 12mm structure, 8mm back, cushioned seat with anti-termite treatment', materials: 'MDF, Standard Laminate (Greenlam/Century), SS 304 Hardware', rate: 1659 } :
        categoryType === 'premium' ?
        { specs: 'BWR Plywood, Acrylic laminate, 25mm cushion, 6"x2" SS base legs with anti-termite treatment', materials: 'BWR Plywood (Century/Greenply), Acrylic Finish (Luxe/Sleek), Hettich Soft-close Hardware', rate: 2821 } :
        { specs: 'Italian Marble Top, HDHMR with PU-coated finish, Italian Leather Cushion, Concealed LED lighting', materials: 'Italian Marble (Statuario/Carrara), HDHMR, Blum Premium Hardware, Imported Leather', rate: 5500 };

      items.push({
        id: itemId++,
        description: 'Civil Works - Entrance Foyer Custom Built-in Storage Unit with Seating (1800mm x 600mm)',
        specifications: shoeRackSpecs.specs,
        materials: shoeRackSpecs.materials,
        unit: 'sq.ft',
        quantity: 12,
        rate: shoeRackSpecs.rate,
        amount: 12 * shoeRackSpecs.rate
      });
      totalCost += 12 * shoeRackSpecs.rate;

      const tvUnitSpecs = categoryType === 'standard' ?
        { specs: 'MDF 18mm, Laminated Panels with edge banding, Soft-close Hinges, Concealed wiring channels', materials: 'MDF, Standard Laminate (Greenlam/Century), Hettich Basic Hardware', rate: 1221 } :
        categoryType === 'premium' ?
        { specs: 'BWR Plywood 19mm with Acrylic Panel, LED Backlit Panels, Concealed wiring management', materials: 'BWR Plywood (Century/Greenply), Acrylic Finish (Luxe/Sleek), Hettich Hardware, LED Lighting', rate: 2450 } :
        { specs: 'Imported Polycarbonate Panels, Italian Marble accents, Hafele Premium Hardware, Smart Lighting Integration', materials: 'Italian Marble (Statuario/Carrara), Blum Premium Hardware, Smart Lighting System with App Control', rate: 6500 };

      items.push({
        id: itemId++,
        description: 'Interior Works - Living Area: Wall-mounted Entertainment Unit with Concealed Storage (2100mm x 1500mm)',
        specifications: tvUnitSpecs.specs,
        materials: tvUnitSpecs.materials,
        unit: 'sq.ft',
        quantity: 34,
        rate: tvUnitSpecs.rate,
        amount: 34 * tvUnitSpecs.rate
      });
      totalCost += 34 * tvUnitSpecs.rate;

      const kitchenSpecs = categoryType === 'standard' ?
        { specs: 'MDF 18mm carcass, Laminate Finish, Hettich Soft Close hinges, SS sink with single bowl', materials: 'MDF, Standard Laminate (Greenlam/Century), Hettich Hardware, SS 304 Sink', rate: 1796 } :
        categoryType === 'premium' ?
        { specs: 'BWR Plywood 19mm with Acrylic Finish, Hafele Soft Close mechanisms, SS sink with double bowl', materials: 'BWR Plywood (Century/Greenply), Acrylic Finish (Luxe/Sleek), Hafele Hardware, Imported SS Sink', rate: 3125 } :
        { specs: 'HDHMR with Italian PU Gloss finish, Blum Servo Drive mechanisms, Imported Quartz countertop, Smart Storage solutions', materials: 'HDHMR, PU Finish (ICA/Sirca), Blum Hardware, Imported Quartz (Caesarstone/Corian)', rate: 8500 };

      const kitchenArea = Math.max(75, carpetArea * 0.15);
      items.push({
        id: itemId++,
        description: 'MEP & Interior Works - Kitchen: Modular Kitchen with Base Units, Wall Units, and Service Integration',
        specifications: kitchenSpecs.specs,
        materials: kitchenSpecs.materials,
        unit: 'sq.ft',
        quantity: kitchenArea,
        rate: kitchenSpecs.rate,
        amount: kitchenArea * kitchenSpecs.rate
      });
      totalCost += kitchenArea * kitchenSpecs.rate;

      const wardrobeSpecs = categoryType === 'standard' ?
        { specs: 'MDF 18mm carcass, Standard Hinges, Basic Storage configuration with loft storage', materials: 'MDF, Standard Laminate (Greenlam/Century), Hettich Basic Hardware', rate: 1671 } :
        categoryType === 'premium' ?
        { specs: 'BWR Plywood 19mm with Acrylic Finish, Soft-close Hafele Hinges, Specialized storage compartments', materials: 'BWR Plywood (Century/Greenply), Acrylic Finish (Luxe/Sleek), Hafele Premium Hardware', rate: 3200 } :
        { specs: 'HDHMR with Italian Veneer, PU Coated finish, Blum Servo Drive, Integrated LED lighting', materials: 'HDHMR, Italian Veneer (Tabu/Alpi), Blum Hardware, Smart Lighting Integration', rate: 9500 };

      const wardrobeArea = Math.max(42, carpetArea * 0.1);
      items.push({
        id: itemId++,
        description: 'Interior Works - Master Bedroom: Floor-to-Ceiling Built-in Wardrobe with Loft Storage',
        specifications: wardrobeSpecs.specs,
        materials: wardrobeSpecs.materials,
        unit: 'sq.ft',
        quantity: wardrobeArea,
        rate: wardrobeSpecs.rate,
        amount: wardrobeArea * wardrobeSpecs.rate
      });
      totalCost += wardrobeArea * wardrobeSpecs.rate;

      const lightingCost = categoryType === 'standard' ? 24087 : categoryType === 'premium' ? 42500 : 120000;
      items.push({
        id: itemId++,
        description: 'Electrical Works: Comprehensive Lighting System with Point Wiring, Fixtures, and Controls',
        specifications: categoryType === 'standard' ? 'ISI Wiring, Polycab, Standard Switches, MCB Distribution Board' : categoryType === 'premium' ? 'Finolex/Havells Wiring, LED Smart Switches, Legrand/Schneider MCBs' : 'Anchor/Polycab FRLS Wiring, Smart Home Control, Lutron Lighting, Motion Sensors',
        materials: 'Electrical conduits, wiring, MCB/RCCB, switches, fixtures and controls',
        unit: 'LUMP SUM',
        quantity: 1,
        rate: lightingCost,
        amount: lightingCost
      });
      totalCost += lightingCost;
    } else if (projectTypeKey === 'commercial') {
      const officePartitionRate = categoryType === 'standard' ? 1485 : categoryType === 'premium' ? 2575 : 4500;
      const officePartitionArea = carpetArea * 0.3;
      items.push({
        id: itemId++,
        description: 'Interior Works - Office Space: Modular Partition System with Acoustic Treatment',
        specifications: categoryType === 'standard' ? 'Aluminum Frame 50mm, 5mm Glass/12mm MDF Panels, Sound Absorption Rating: NRC 0.5' : categoryType === 'premium' ? 'Sleek Aluminum 75mm, Acoustic Panels with Sound Absorption Rating: NRC 0.7' : 'Frameless 12mm Toughened Glass, Full Soundproofing with Sound Absorption Rating: NRC 0.9',
        materials: categoryType === 'standard' ? 'Standard Glass/MDF, Aluminum Sections, Acoustic Insulation' : categoryType === 'premium' ? 'Premium Acoustic Materials, Powder-coated Aluminum, Sound Dampening Inserts' : 'Toughened Glass, High-end Stainless Steel Fittings, Specialized Acoustic Treatment',
        unit: 'sq.ft',
        quantity: officePartitionArea,
        rate: officePartitionRate,
        amount: officePartitionArea * officePartitionRate,
      });
      totalCost += officePartitionArea * officePartitionRate;

      const workstationRate = categoryType === 'standard' ? 7850 : categoryType === 'premium' ? 14750 : 29500;
      const numWorkstations = Math.floor(carpetArea / 80);
      items.push({
        id: itemId++,
        description: 'Furniture & Fixtures - Workstation Clusters with Cable Management and Ergonomic Solutions',
        specifications: categoryType === 'standard' ? 'Basic Desk (1200x600mm), Ergonomic Chair, Under-desk Cable Management' : categoryType === 'premium' ? 'Ergonomic Chair with Lumbar Support, Modular Desk (1500x750mm) with Height Adjustment' : 'High-end Ergonomic Setup with Sit-Stand Mechanism, Integrated Tech Hub, Biophilic Elements',
        materials: categoryType === 'standard' ? 'MDF with Laminate Finish, Basic Mesh Fabric, Steel Frame' : categoryType === 'premium' ? 'BWR Plywood with PU Finish, Premium Mesh/Fabric, Aluminum Frame' : 'Solid Wood/Metal Construction, Premium Leather/Mesh Upholstery, Integrated Power/Data Solutions',
        unit: 'Nos',
        quantity: numWorkstations,
        rate: workstationRate,
        amount: numWorkstations * workstationRate,
      });
      totalCost += numWorkstations * workstationRate;

    } else if (projectTypeKey === 'industrial') {
      const flooringRate = categoryType === 'standard' ? 285 : categoryType === 'premium' ? 625 : 1175;
      items.push({
        id: itemId++,
        description: 'Civil Works - Industrial Grade Flooring System with Chemical Resistance',
        specifications: categoryType === 'standard' ? 'Epoxy Coating 2mm thickness, Anti-skid finish, Load Bearing Capacity: 5 tons/sqm' : categoryType === 'premium' ? 'Polished Concrete with Hardeners, 4mm Epoxy Topping, Load Bearing Capacity: 8 tons/sqm' : 'Heavy-duty Polyurethane Resin Flooring 6mm, Chemical Resistant, Load Bearing Capacity: 12 tons/sqm',
        materials: 'Concrete Base, Epoxy/Polyurethane Resin, Hardeners, Anti-skid Additives',
        unit: 'sq.ft',
        quantity: carpetArea,
        rate: flooringRate,
        amount: carpetArea * flooringRate,
      });
      totalCost += carpetArea * flooringRate;

      const industrialLightingCost = categoryType === 'standard' ? 42500 : categoryType === 'premium' ? 68750 : 145000;
      items.push({
        id: itemId++,
        description: 'Electrical Works - Industrial Lighting System with Emergency Backup',
        specifications: categoryType === 'standard' ? 'High-bay LED Fixtures (150W), IP65 Rating, 120 lm/W Efficiency' : categoryType === 'premium' ? 'Energy-efficient Smart LEDs (200W), IP66 Rating, 150 lm/W Efficiency, Daylight Sensors' : 'High-performance DALI-controlled LED System, IP67 Rating, 180 lm/W Efficiency, Emergency Backup',
        materials: 'Industrial Grade LED Fixtures, FRLS Wiring, Distribution Boards, Emergency Backup System',
        unit: 'LUMP SUM',
        quantity: 1,
        rate: industrialLightingCost,
        amount: industrialLightingCost,
      });
      totalCost += industrialLightingCost;

    } else if (projectTypeKey === 'hospitality') {
      const guestRoomFitoutRate = categoryType === 'standard' ? 48500 : categoryType === 'premium' ? 118500 : 295000;
      const numRooms = parseInt(projectDetails.numberOfRooms || '10');
      items.push({
        id: itemId++,
        description: 'Interior & MEP Works - Guest Room Complete Fit-out Package',
        specifications: categoryType === 'standard' ? 'Standard Furniture Package, Basic Amenities, 3-Star Equivalent Specifications' : categoryType === 'premium' ? 'Custom Furniture Package, Upgraded Amenities, 4-Star Equivalent Specifications' : 'Luxury Bespoke Furniture, High-end Tech Integration, 5-Star Equivalent Specifications with Smart Controls',
        materials: categoryType === 'standard' ? 'Commercial Grade MDF/Particle Board, Standard Fabrics, Basic Fixtures' : categoryType === 'premium' ? 'BWR Plywood with Veneer/Laminate, Quality Fabrics, Premium Fixtures' : 'Solid Wood Construction, Imported Fabrics, Italian Marble Accents, Designer Fixtures',
        unit: 'Nos',
        quantity: numRooms,
        rate: guestRoomFitoutRate,
        amount: numRooms * guestRoomFitoutRate,
      });
      totalCost += numRooms * guestRoomFitoutRate;

      const lobbyFitoutRate = categoryType === 'standard' ? 1950 : categoryType === 'premium' ? 3850 : 9750;
      const lobbyArea = carpetArea * 0.1;
      items.push({
        id: itemId++,
        description: 'Interior & Civil Works - Lobby & Reception Area with Feature Elements',
        specifications: categoryType === 'standard' ? 'Standard Reception Desk (3000x600mm), Waiting Area Seating, Basic Signage' : categoryType === 'premium' ? 'Custom Marble Reception Counter, Designer Seating, Accent Lighting, Digital Signage' : 'Bespoke Millwork with Integrated Technology, Luxury Furnishings, Feature Lighting Installation, Interactive Digital Elements',
        materials: categoryType === 'standard' ? 'Commercial Grade Laminate, Basic Contract Furniture, Standard Lighting' : categoryType === 'premium' ? 'Imported Marble, Quality Contract Furniture, Designer Lighting' : 'Italian Marble, Designer Furniture Pieces, Custom Lighting Fixtures, Premium Decorative Elements',
        unit: 'sq.ft',
        quantity: lobbyArea,
        rate: lobbyFitoutRate,
        amount: lobbyArea * lobbyFitoutRate,
      });
      totalCost += lobbyArea * lobbyFitoutRate;
    }

    const contingencyAmount = totalCost * 0.05;
    items.push({
      id: itemId++,
      description: 'Contingency (5%)',
      specifications: 'Allowance for unforeseen items or changes',
      materials: '-',
      unit: 'LUMP SUM',
      quantity: 1,
      rate: contingencyAmount,
      amount: contingencyAmount,
    });
    totalCost += contingencyAmount;

    return { items, totalCost: Number(totalCost.toFixed(2)) };
  };


  const handleEditItem = (id: number) => {
    setBoqItems(items =>
      items.map(item => {
        if (item.id === id) {
          setOriginalItemData({ ...item });
          return {
            ...item,
            isEditing: true,
            editedQuantity: item.quantity.toString(),
            editedRate: item.rate.toString()
          };
        }
        return { ...item, isEditing: false };
      })
    );
  };

  const handleInputChange = (id: number, field: 'quantity' | 'rate' | 'description' | 'specifications' | 'materials' | 'unit', value: string) => {
    setBoqItems(items =>
      items.map(item =>
        item.id === id
          ? { 
              ...item, 
              [field === 'quantity' ? 'editedQuantity' : 
               field === 'rate' ? 'editedRate' : 
               field === 'description' ? 'editedDescription' : 
               field === 'specifications' ? 'editedSpecifications' : 
               field === 'materials' ? 'editedMaterials' : 'editedUnit']: value 
            }
          : item
      )
    );
  };

  const handleSaveItem = (id: number) => {
    setBoqItems(items => {
      const updatedItems = items.map(item => {
        if (item.id === id) {
          const newQuantity = parseFloat(item.editedQuantity || item.quantity.toString() || '0');
          const newRate = parseFloat(item.editedRate || item.rate.toString() || '0');
          const newDescription = item.editedDescription || item.description;
          const newSpecifications = item.editedSpecifications || item.specifications;
          const newMaterials = item.editedMaterials || item.materials;
          const newUnit = item.editedUnit || item.unit;
          return {
            ...item,
            description: newDescription,
            specifications: newSpecifications,
            materials: newMaterials,
            unit: newUnit,
            quantity: newQuantity,
            rate: newRate,
            amount: newQuantity * newRate,
            isEditing: false,
            editedDescription: undefined,
            editedSpecifications: undefined,
            editedMaterials: undefined,
            editedUnit: undefined,
            editedQuantity: undefined,
            editedRate: undefined
          };
        }
        return item;
      });

      let subTotal = updatedItems
        .filter(item => !item.description.includes('Contingency'))
        .reduce((acc, currentItem) => acc + currentItem.amount, 0);

      const contingencyItemIndex = updatedItems.findIndex(item => item.description.includes('Contingency'));
      let finalItems = [...updatedItems];
      let newTotalAmount = subTotal;

      if (contingencyItemIndex !== -1) {
        const contingencyAmount = subTotal * 0.05;
        finalItems[contingencyItemIndex] = {
          ...finalItems[contingencyItemIndex],
          rate: contingencyAmount,
          amount: contingencyAmount
        };
        newTotalAmount += contingencyAmount;
      } else {
        const contingencyAmount = subTotal * 0.05;
        const nextId = Math.max(...finalItems.map(i => i.id), 0) + 1;
        finalItems.push({
          id: nextId, description: 'Contingency (5%)', specifications: 'Allowance for unforeseen items or changes', materials: '-', unit: 'LUMP SUM', quantity: 1, rate: contingencyAmount, amount: contingencyAmount
        });
        newTotalAmount += contingencyAmount;
      }

      setTotalAmount(Number(newTotalAmount.toFixed(2)));
      setOriginalItemData(null);
      return finalItems;
    });
  };

  const handleCancelEdit = (id: number) => {
    setBoqItems(items =>
      items.map(item =>
        (item.id === id && originalItemData) ?
          {
            ...originalItemData,
            isEditing: false,
            editedQuantity: undefined,
            editedRate: undefined
          }
          : item
      )
    );
    setOriginalItemData(null);
  };

  const calculateGST = (amount: number) => {
    return amount * 0.18;
  };



  const handleDownloadPDF = async () => {
    const boqData = {
      projectDetails: {
        ...projectDetails,
        projectType
      },
      selectedCategory,
      items: boqItems,
      totalAmount,
      generatedDate: new Date().toLocaleDateString()
    };

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let finalY = margin;

    const headerImg = new Image();
    headerImg.src = headerImage;
    await new Promise(resolve => headerImg.onload = resolve);
    const headerRatio = pdfWidth / headerImg.width;
    const headerHeight = headerImg.height * headerRatio;

    const footerImg = new Image();
    footerImg.src = footerImage;
    await new Promise(resolve => footerImg.onload = resolve);
    const footerRatio = pdfWidth / footerImg.width;
    const footerHeight = footerImg.height * footerRatio;
    const footerY = pdfHeight - footerHeight;

    const watermarkImg = new Image();
    watermarkImg.src = watermarkImage;
    await new Promise(resolve => watermarkImg.onload = resolve);
    const watermarkRatio = Math.min(pdfWidth / watermarkImg.width, pdfHeight / watermarkImg.height) * 0.5;
    const watermarkWidth = watermarkImg.width * watermarkRatio;
    const watermarkHeight = watermarkImg.height * watermarkRatio;
    const watermarkX = (pdfWidth - watermarkWidth) / 2;
    const watermarkY = (pdfHeight - watermarkHeight) / 2;

    const addPageElements = () => {
      pdf.addImage(headerImg, 'PNG', 0, 0, pdfWidth, headerHeight);
      pdf.saveGraphicsState();
      (pdf as any).setGState(new (pdf as any).GState({ opacity: 0.1 }));
      pdf.addImage(watermarkImg, 'PNG', watermarkX, watermarkY, watermarkWidth, watermarkHeight);
      pdf.restoreGraphicsState();
      pdf.addImage(footerImg, 'PNG', 0, footerY, pdfWidth, footerHeight);
    };

    finalY = headerHeight + 10;

    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Bill of Quantities', pdfWidth / 2, finalY, { align: 'center' });
    finalY += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Project Information', margin, finalY);
    pdf.text('Project Details', pdfWidth / 2 + margin / 2, finalY);
    finalY += 6;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const infoCol1 = [
      `Client Name: ${boqData.projectDetails?.clientName || 'N/A'}`,
      `Project Name: ${boqData.projectDetails?.projectName || 'N/A'}`,
      `Location: ${boqData.projectDetails?.location || 'N/A'}`,
      `Date: ${boqData.generatedDate || new Date().toLocaleDateString()}`
    ];
    const infoCol2 = [
      `Project Type: ${boqData.projectDetails?.projectType || 'N/A'}`,
      `Category: ${boqData.selectedCategory?.type || 'N/A'}`,
      `Total Carpet Area: ${boqData.projectDetails?.carpetArea || 'N/A'} sq.ft`
    ];

    infoCol1.forEach((line, index) => {
      pdf.text(line, margin, finalY + index * 5);
    });
    infoCol2.forEach((line, index) => {
      pdf.text(line, pdfWidth / 2 + margin / 2, finalY + index * 5);
    });
    finalY += Math.max(infoCol1.length, infoCol2.length) * 5 + 5;

    // Create table headers without rupee symbol
    const head = [['S.No', 'Description', 'Specifications', 'Materials', 'Unit', 'Qty', 'Rate', 'Amount']];
    const body = boqItems.map((item) => [
      item.id,
      item.description,
      item.specifications,
      item.materials,
      item.unit,
      item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(2),
      formatIndianNumber(item.rate),
      formatIndianNumber(item.amount)
    ]);

    autoTable(pdf, {
      head: head,
      body: body,
      startY: finalY,
      theme: 'grid',
      headStyles: { fillColor: [241, 212, 155], textColor: [0, 0, 0], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 1.5, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 10 }, 1: { cellWidth: 35 }, 2: { cellWidth: 35 }, 3: { cellWidth: 30 }, 4: { cellWidth: 12 }, 5: { cellWidth: 15, halign: 'right' }, 6: { cellWidth: 20, halign: 'right' }, 7: { cellWidth: 20, halign: 'right' }
      },
      margin: { top: headerHeight + 5, bottom: footerHeight + 5, left: margin, right: margin },
      didDrawPage: () => { addPageElements(); },
      didParseCell: function () { /* Custom cell parsing if needed */ }
    });

    finalY = (pdf as any).lastAutoTable.finalY + 10;

    const subtotal = boqItems.reduce((acc, item) => acc + item.amount, 0);
    const gst = calculateGST(subtotal);
    const grandTotal = subtotal + gst;

    // Format all monetary values with Indian number system and without rupee symbol
    const summaryData = [
      ['Subtotal:', formatIndianNumber(subtotal)],
      ['GST (18%):', formatIndianNumber(gst)],
      ['Grand Total:', formatIndianNumber(grandTotal)]
    ];

    const summaryHeight = summaryData.length * 5 + 10;
    if (finalY + summaryHeight > pdfHeight - footerHeight - margin) {
      pdf.addPage();
      addPageElements();
      finalY = headerHeight + 10;
    }

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Cost Summary', margin, finalY);
    finalY += 6;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    summaryData.forEach((row, index) => {
      const currentY = finalY + index * 5;
      if (index === summaryData.length - 1) {
        pdf.setDrawColor(150, 150, 150);
        pdf.line(margin, currentY - 1.5, pdfWidth - margin, currentY - 1.5);
        // Add extra space before Grand Total to prevent line overlap
        const grandTotalY = currentY + 3; // Increased spacing for Grand Total
        pdf.setFont('helvetica', 'bold');
        pdf.text(row[0], margin, grandTotalY);
        pdf.text(row[1], pdfWidth - margin, grandTotalY, { align: 'right' });
      } else {
        pdf.setFont('helvetica', 'normal');
        pdf.text(row[0], margin, currentY);
        pdf.text(row[1], pdfWidth - margin, currentY, { align: 'right' });
      }
    });
    finalY += summaryData.length * 5 + 5;

    const notes = [
      'This BOQ is an estimate based on the provided information.',
      'Actual costs may vary based on site conditions and material availability.',
      'Taxes and permits are included in the final cost.',
      'The rates are based on current market prices and may be subject to change.',
      'Detailed specifications and materials are subject to client approval.'
    ];
    const notesHeight = notes.length * 5 + 10;
    if (finalY + notesHeight > pdfHeight - footerHeight - margin) {
      pdf.addPage();
      addPageElements();
      finalY = headerHeight + 10;
    }

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Notes', margin, finalY);
    finalY += 6;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    notes.forEach((note, index) => {
      pdf.text(`• ${note}`, margin + 5, finalY + index * 5);
    });

    try {
      pdf.save(`BOQ_${boqData.projectDetails?.clientName || 'Details'}.pdf`);
    } catch (error) {
      console.error("Error saving PDF: ", error);
      alert("Failed to download PDF. See console for details.");
    }
  };

  const displayProjectType = projectType ? projectType.charAt(0).toUpperCase() + projectType.slice(1) : '';
  const displayCategoryType = selectedCategory.type ? selectedCategory.type.charAt(0).toUpperCase() + selectedCategory.type.slice(1) : '';

  return (
    <motion.div // Changed D to motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-[#f9e650] to-[#f1d49b] text-transparent bg-clip-text"
        >
          Generate BOQ
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 text-center mb-6 text-lg"
        >
          Review your project details and generate the Bill of Quantities.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mb-10"
        >
          <button
            onClick={handleGenerateBOQ}
            disabled={isGenerating}
            className="bg-[#f1d49b] hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg text-xl shadow-xl flex items-center gap-3 transform hover:scale-105 transition-all duration-200 border-2 border-[#f9e650]/30"
          >
            {isGenerating ? (
              <>
                <span className="animate-pulse">Generating BOQ...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                </svg>
                Generate BOQ
              </>
            )}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#f5f0e0] rounded-2xl shadow-xl border border-[#e0d8c0]/50 p-6 md:p-8 mb-8"
        >
          <h2 className="text-2xl font-semibold text-black mb-6 border-b border-[#d0c8b0] pb-3">Project Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-[#f9f5e8] rounded-lg border border-[#e0d8c0]">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-black">Project Information</h3>
                <button 
                  onClick={() => setIsEditingProjectInfo(!isEditingProjectInfo)}
                  className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Edit size={16} />
                </button>
              </div>
              <div className="space-y-1.5 text-gray-300 text-sm">
                {isEditingProjectInfo ? (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Client Name</label>
                      <input
                        type="text"
                        value={editedProjectDetails.clientName || ''}
                        onChange={(e) => setEditedProjectDetails({...editedProjectDetails, clientName: e.target.value})}
                        className="block w-full px-2 py-1 rounded bg-[#2a2a2a] border border-[#444] text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#f1d49b]/50 focus:border-[#f1d49b]/80 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Project Name</label>
                      <input
                        type="text"
                        value={editedProjectDetails.projectName || ''}
                        onChange={(e) => setEditedProjectDetails({...editedProjectDetails, projectName: e.target.value})}
                        className="block w-full px-2 py-1 rounded bg-[#2a2a2a] border border-[#444] text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#f1d49b]/50 focus:border-[#f1d49b]/80 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Location</label>
                      <input
                        type="text"
                        value={editedProjectDetails.location || ''}
                        onChange={(e) => setEditedProjectDetails({...editedProjectDetails, location: e.target.value})}
                        className="block w-full px-2 py-1 rounded bg-[#2a2a2a] border border-[#444] text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#f1d49b]/50 focus:border-[#f1d49b]/80 text-sm"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 mt-3">
                      <button
                        onClick={handleSaveProjectInfo}
                        className="p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={handleCancelEditProjectInfo}
                        className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p><span className="font-medium text-gray-800">Client:</span> {projectDetails.clientName || 'N/A'}</p>
                    {projectDetails.projectName && (
                      <p><span className="font-medium text-gray-800">Project:</span> {projectDetails.projectName}</p>
                    )}
                    <p><span className="font-medium text-gray-800">Type:</span> {displayProjectType || 'N/A'}</p>
                    <p><span className="font-medium text-gray-800">Location:</span> {projectDetails.location || 'N/A'}</p>
                  </>
                )}
              </div>
            </div>
            <div className="p-5 bg-[#f9f5e8] rounded-lg border border-[#e0d8c0]">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-black">Costing Details</h3>
                <button 
                  onClick={() => setIsEditingCostingDetails(!isEditingCostingDetails)}
                  className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Edit size={16} />
                </button>
              </div>
              <div className="space-y-1.5 text-gray-300 text-sm">
                {isEditingCostingDetails ? (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Carpet Area (sq.ft)</label>
                      <input
                        type="number"
                        value={editedProjectDetails.carpetArea || ''}
                        onChange={(e) => setEditedProjectDetails({...editedProjectDetails, carpetArea: e.target.value})}
                        className="block w-full px-2 py-1 rounded bg-[#2a2a2a] border border-[#444] text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#f1d49b]/50 focus:border-[#f1d49b]/80 text-sm"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 mt-3">
                      <button
                        onClick={handleSaveCostingDetails}
                        className="p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={handleCancelEditCostingDetails}
                        className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p><span className="font-medium text-gray-800">Carpet Area:</span> {projectDetails.carpetArea || 'N/A'} sq.ft</p>
                    <p><span className="font-medium text-gray-800">Category:</span> {displayCategoryType || 'N/A'}</p>
                    {selectedCategory.type === 'custom' && (
                      <p><span className="font-medium text-gray-800">Custom Rate:</span> {`₹${(selectedCategory.customRate || 0).toFixed(2)}`}/sq.ft</p>
                    )}
                    <p><span className="font-medium text-gray-800">Date:</span> {new Date().toLocaleDateString()}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Generate BOQ button removed */}
        {boqGenerated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#f5f0e0] rounded-2xl shadow-xl border border-[#e0d8c0]/50 p-6 md:p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-2xl font-semibold text-black">Bill of Quantities</h2>
              <div className="flex space-x-3">
                <button onClick={handleDownloadPDF} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3 rounded-md text-xs transition duration-200">
                  <Download size={14} /> Download PDF
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1.5 px-3 rounded-md text-xs transition duration-200">
                  <Printer size={14} /> Print
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#444] rounded-lg shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="bg-[#2a2a2a]/80 border-b border-[#444]">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold text-gray-300 border-r border-[#444]">S.No</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-300 border-r border-[#444] min-w-[200px]">Description</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-300 border-r border-[#444] min-w-[250px]">Specifications</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-300 border-r border-[#444] min-w-[200px]">Materials</th>
                    <th className="py-3 px-4 text-center font-semibold text-gray-300 border-r border-[#444]">Unit</th>
                    <th className="py-3 px-4 text-right font-semibold text-gray-300 border-r border-[#444]">Quantity</th>
                    <th className="py-3 px-4 text-right font-semibold text-gray-300 border-r border-[#444] min-w-[120px]">Rate ₹</th>
                    <th className="py-3 px-4 text-right font-semibold text-gray-300 border-r border-[#444] min-w-[120px]">Amount ₹</th>
                    <th className="py-3 px-4 text-center font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {boqItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-4 text-gray-400">Generating BOQ items...</td>
                    </tr>
                  ) : (
                    boqItems.map((item) => (
                      <tr key={item.id} className="border-b border-[#444] hover:bg-[#2a2a2a]/30">
                        <td className="py-3 px-4 text-gray-300 border-r border-[#444]">{item.id}</td>
                        <td className="py-3 px-4 text-gray-300 border-r border-[#444]">
                          {item.isEditing ? (
                            <textarea
                              value={item.editedDescription || item.description}
                              onChange={(e) => handleInputChange(item.id, 'description', e.target.value)}
                              className={`${tableInputStyle} min-h-[60px] w-full`}
                            />
                          ) : (
                            item.description
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-300 border-r border-[#444]">
                          {item.isEditing ? (
                            <textarea
                              value={item.editedSpecifications || item.specifications}
                              onChange={(e) => handleInputChange(item.id, 'specifications', e.target.value)}
                              className={`${tableInputStyle} min-h-[60px] w-full`}
                            />
                          ) : (
                            item.specifications
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-300 border-r border-[#444]">
                          {item.isEditing ? (
                            <textarea
                              value={item.editedMaterials || item.materials}
                              onChange={(e) => handleInputChange(item.id, 'materials', e.target.value)}
                              className={`${tableInputStyle} min-h-[60px] w-full`}
                            />
                          ) : (
                            item.materials
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-300 border-r border-[#444]">
                          {item.isEditing ? (
                            <input
                              type="text"
                              value={item.editedUnit || item.unit}
                              onChange={(e) => handleInputChange(item.id, 'unit', e.target.value)}
                              className={`${tableInputStyle} w-full text-center`}
                            />
                          ) : (
                            item.unit
                          )}
                        </td>
                        {item.isEditing ? (
                          <td className="py-3 px-4 text-right border-r border-[#444]">
                            <input
                              type="number"
                              value={item.editedQuantity}
                              onChange={(e) => handleInputChange(item.id, 'quantity', e.target.value)}
                              className={tableInputStyle}
                            />
                          </td>
                        ) : (
                          <td className="py-3 px-4 text-right text-gray-300 border-r border-[#444]">{item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(2)}</td>
                        )}
                        {item.isEditing ? (
                          <td className="py-3 px-4 text-right border-r border-[#444]">
                            <input
                              type="number"
                              value={item.editedRate}
                              onChange={(e) => handleInputChange(item.id, 'rate', e.target.value)}
                              className={tableInputStyle}
                            />
                          </td>
                        ) : (
                          <td className="py-3 px-4 text-right text-gray-300 border-r border-[#444]">₹ {formatIndianNumber(item.rate)}</td>
                        )}
                        <td className="py-3 px-4 text-right text-gray-300 border-r border-[#444]">₹ {formatIndianNumber(item.amount)}</td>
                        <td className="py-3 px-4 text-center">
                          {item.isEditing ? (
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => handleSaveItem(item.id)}
                                className="p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => handleCancelEdit(item.id)}
                                className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditItem(item.id)}
                              className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : null}
      </div>
    </motion.div> // Added closing motion.div tag
  );
}

export default BOQGeneration; // Ensure export is correct if needed
