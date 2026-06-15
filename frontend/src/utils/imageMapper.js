/**
 * Helper function to map external (http/https) image URLs to local preview images
 * located in frontend/public/images/previews (served at /images/previews/).
 *
 * @param {string} imageSrc - The original image URL
 * @param {string} category - Product category
 * @param {string} name - Product name
 * @returns {string} Mapped local image URL or the original local URL
 */
export const getProductImage = (imageSrc, category = '', name = '') => {
  const isExternal = typeof imageSrc === 'string' && (imageSrc.startsWith('http://') || imageSrc.startsWith('https://') || imageSrc.startsWith('//'));
  const isEmpty = !imageSrc || typeof imageSrc !== 'string' || !imageSrc.trim();

  if (isExternal || isEmpty) {
    const cleanCategory = String(category).toLowerCase();
    const cleanName = String(name).toLowerCase();
    const srcLower = typeof imageSrc === 'string' ? imageSrc.toLowerCase() : '';

    // 1. Match by keyword in URL or name
    if (srcLower.includes('shirt') || cleanName.includes('рубашка') || cleanName.includes('одежда')) {
      return '/images/previews/shirt.jpg';
    }
    if (
      srcLower.includes('sneaker') || 
      srcLower.includes('shoe') || 
      srcLower.includes('boot') || 
      cleanName.includes('кеды') || 
      cleanName.includes('обувь') || 
      cleanName.includes('кроссовки') ||
      cleanName.includes('ботинки')
    ) {
      return '/images/previews/sneakers.jpg';
    }
    if (srcLower.includes('baguette') || srcLower.includes('bread') || cleanName.includes('багет') || cleanName.includes('хлеб') || cleanName.includes('булка')) {
      return '/images/previews/baguette.jpg';
    }
    if (srcLower.includes('honey') || cleanName.includes('мед') || cleanName.includes('мёд')) {
      return '/images/previews/honey.jpg';
    }
    if (srcLower.includes('radio') || cleanName.includes('радио') || cleanName.includes('приемник') || cleanName.includes('приёмник')) {
      return '/images/previews/radio.jpg';
    }
    if (srcLower.includes('headphone') || srcLower.includes('sound') || srcLower.includes('audio') || cleanName.includes('наушники')) {
      return '/images/previews/headphones.jpg';
    }

    // 2. Fallback to category-based matching
    if (cleanCategory.includes('вещ') || cleanCategory.includes('одежд') || cleanCategory.includes('обув')) {
      return cleanName.includes('обувь') || cleanName.includes('кеды') || cleanName.includes('кроссовки') 
        ? '/images/previews/sneakers.jpg' 
        : '/images/previews/shirt.jpg';
    }
    if (cleanCategory.includes('продукт') || cleanCategory.includes('еда') || cleanCategory.includes('напит')) {
      return cleanName.includes('мед') || cleanName.includes('мёд') 
        ? '/images/previews/honey.jpg' 
        : '/images/previews/baguette.jpg';
    }
    if (cleanCategory.includes('электрон') || cleanCategory.includes('техник') || cleanCategory.includes('гаджет')) {
      return cleanName.includes('наушник') 
        ? '/images/previews/headphones.jpg' 
        : '/images/previews/radio.jpg';
    }

    // 3. Absolute default fallback
    return '/images/previews/shirt.jpg';
  }

  // Return original local path (e.g. /images/previews/shirt.jpg or /uploads/xxx.jpg)
  return imageSrc;
};
