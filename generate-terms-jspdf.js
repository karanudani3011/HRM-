import fs from 'fs';
import path from 'path';
import { jsPDF } from 'jspdf';

// Read Nirmala UI font (or Shruti if available, let's check Nirmala.ttc or font file)
// Since jsPDF addFont supports base64 ttf/woff, let's load a system ttf or use HTML rendering if needed.
// Wait, jsPDF node support for base64 font works great for TTF!
// Let's check if we can read a ttf font file or convert HTML to canvas.
