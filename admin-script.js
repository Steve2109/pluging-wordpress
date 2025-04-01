jQuery(document).ready(function($) {
    // Variables globales
    let parsedProducts = [];
    let currentPage = 1;
    let totalPages = 1;
    
    // Funciones de utilidad
    const generateSKU = (brand, name) => {
        const cleanBrand = brand.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 4);
        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const nameHash = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 4);
        return `${cleanBrand}-${nameHash}-${randomNum}`;
    };
    
    const formatCurrency = (price) => {
        return parseFloat(price.replace(/[^0-9.-]+/g, "")).toFixed(2);
    };
    
    const extractShortDescription = (productString) => {
        const parts = [];
        
        // Extraer información básica
        if (productString.includes('ASUS')) parts.push('Nombre: ASUS VIVOBOOK');
        
        // Extraer tamaño de pantalla
        const screenMatch = productString.match(/(\d+\.?\d*)"?\s*(?:FHD|HD|UHD|FULL HD)/i);
        if (screenMatch) parts.push(`Pantalla: ${screenMatch[0].replace('"', '')}`);
        
        // Extraer procesador
        const cpuMatch = productString.match(/(?:i\d-\d{4}[A-Z]*|i\d{1,2}-\d{4,5}[A-Z]*|Ryzen\s*\d[A-Z]*\s*\d{4}[A-Z]*|Celeron|Pentium)/i);
        if (cpuMatch) parts.push(`Procesador: ${cpuMatch[0]}`);
        
        // Extraer RAM
        const ramMatch = productString.match(/(\d+)\s*GB\s*RAM/i);
        if (ramMatch) parts.push(`Memoria RAM: ${ramMatch[0]}`);
        
        // Extraer disco
        const diskMatch = productString.match(/(\d+)\s*(?:GB|TB)\s*(?:SSD|HDD|M\.2|NVME)/i);
        if (diskMatch) parts.push(`Disco: ${diskMatch[0]}`);
        
        // Extraer teclado
        const kbMatch = productString.match(/(?:TECL|TECLADO)\s*[A-Z\s]*(?:\+\s*NUM)?/i);
        if (kbMatch) parts.push(`Teclado: ${kbMatch[0].replace('TECL', 'TECLADO')}`);
        
        // Extraer sistema operativo
        const osMatch = productString.match(/(?:WINDOWS|WIN|W|LINUX|FREEDOS|UBUNTU|CHROME OS)[A-Z0-9\s]*/i);
        if (osMatch) parts.push(`Sistema Operativo: ${osMatch[0]}`);
        
        // Extraer color
        const colorMatch = productString.match(/(?:BLACK|NEGRO|WHITE|BLANCO|SILVER|PLATA|BLUE|AZUL|RED|ROJO|GRAY|GRIS)[A-Z]*/i);
        if (colorMatch) parts.push(`Color: ${colorMatch[0]}`);
        
        // Extraer modelo
        const modelMatch = productString.match(/[A-Z0-9]{5,}(?:-[A-Z0-9]+)?/);
        if (modelMatch) parts.push(`Modelo: ${modelMatch[0]}`);
        
        // Extraer accesorios
        const accMatch = productString.match(/INCL[A-Z\s]*/i);
        if (accMatch) parts.push(`Otros: ${accMatch[0]}`);
        
        // Formatear como lista
        return parts.map(part => `* ${part}`).join('\n');
    };
    
    const extractMainInfo = (productString) => {
        // Extraer marca
        let brand = '';
        const brandMatch = productString.match(/(ASUS|HP|DELL|LENOVO|ACER|MSI|APPLE|SAMSUNG|HUAWEI|XIAOMI)/i);
        if (brandMatch) {
            brand = brandMatch[0].toUpperCase();
        }
        
        // Extraer nombre simplificado
        let name = '';
        if (brand) {
            const modelMatch = productString.match(/[A-Z0-9]{5,}(?:-[A-Z0-9]+)?/);
            if (modelMatch) {
                name = `${brand} ${modelMatch[0]}`;
            } else {
                const typeMatch = productString.match(/(?:VIVOBOOK|ZENBOOK|THINKPAD|PAVILION|INSPIRON|LATITUDE|IDEAPAD)/i);
                if (typeMatch) {
                    name = `${brand} ${typeMatch[0].toUpperCase()}`;
                } else {
                    name = brand + ' ' + productString.split(' ').slice(1, 3).join(' ').toUpperCase();
                }
