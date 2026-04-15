# 3D Watch Viewer - Ready for WordPress/WooCommerce Integration

## Quick Start (Standalone)
1. Image integrated: watch-image.png (your Blue-Volta-gold watch) as background + dial texture + sidebar preview.
2. Open `index.html` in any browser.
2. Drag to rotate, scroll to zoom. Fully responsive/mobile-ready.

## WordPress Integration (Shortcode)

### Option 1: Simple Embed (No plugin needed)
Add this to any page/post using **Custom HTML block**:

```html
<!-- 3D Watch Viewer -->
<div style="width:100%; height:500px; position:relative;">
  <script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
  <script src="https://unpkg.com/three@0.160.0/examples/js/controls/OrbitControls.js"></script>
  <script>
    // Paste the COMPLETE contents of watch-3d.js here (container = document.currentScript.parentElement)
  </script>
</div>
```

### Option 2: PHP Shortcode (Recommended for WooCommerce product pages)
Add to your theme's `functions.php`:

```php
function watch_3d_shortcode($atts) {
    ob_start();
    ?>
    <div id="watch-wp-container" style="width:100%; height:500px; border-radius:20px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.3);"></div>
    <script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
    <script src="https://unpkg.com/three@0.160.0/examples/js/controls/OrbitControls.js"></script>
    <script>
      // Modified watch-3d.js for WordPress (change container selector to '#watch-wp-container')
      // Paste modified JS here...
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('watch_3d', 'watch_3d_shortcode');
```

Use `[watch_3d]` on any page/product.

### Option 3: Upload Files to WordPress
1. Upload `watch-3d-viewer` folder to `/wp-content/themes/your-theme/3d-watch/`
2. Use iframe: `<iframe src="/wp-content/themes/your-theme/3d-watch/index.html" width="100%" height="500" frameborder="0"></iframe>`

## Customization
- **Colors**: Edit materials in `watch-3d.js` (e.g., `dialMaterial.color = 0xyourhex`)
- **Real Model**: Replace geometries with GLTFLoader for your photogrammetry scan
- **WooCommerce**: Add to single product template via `functions.php`

## Features Added
- Realistic gold bezel + glass (physical material)
- Animated hands + subtle rotation
- Curved leather straps
- Mobile-responsive
- Shadows + HDR lighting
- WordPress-ready shortcodes

Ready product! 🚀
