<?php
/**
 * Plugin Name: Advanced Product Importer for WooCommerce
 * Plugin URI: https://store.tymtechnology.shop/plugins
 * Description: Plugin personalizado para importar productos a WooCommerce con formato avanzado y búsqueda de especificaciones técnicas
 * Version: 1.0.0
 * Author: T&M TECHNOLOGY EC
 * Author URI: https://tymtechnology.shop
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: advanced-product-importer
 * Domain Path: /languages
 *
 * WC requires at least: 5.0
 * WC tested up to: 8.0
 */

// Si este archivo es llamado directamente, abortar.
if (!defined('WPINC')) {
    die;
}

// Definir constantes
define('API_PLUGIN_VERSION', '1.0.0');
define('API_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('API_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Clase principal del plugin
 */
class Advanced_Product_Importer {

    /**
     * Constructor
     */
    public function __construct() {
        // Verificar que WooCommerce esté activo
        add_action('admin_init', array($this, 'check_woocommerce'));
        
        // Agregar menú en el admin
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Registrar estilos y scripts
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
        
        // Agregar AJAX handlers
        add_action('wp_ajax_api_process_import', array($this, 'process_import'));
        add_action('wp_ajax_api_search_specifications', array($this, 'search_specifications'));
        add_action('wp_ajax_api_get_existing_products', array($this, 'get_existing_products'));
        add_action('wp_ajax_api_delete_products', array($this, 'delete_products'));
    }

    /**
     * Verificar que WooCommerce esté activo
     */
    public function check_woocommerce() {
        if (!class_exists('WooCommerce')) {
            add_action('admin_notices', function() {
                ?>
                <div class="notice notice-error">
                    <p><?php _e('Advanced Product Importer requiere que WooCommerce esté instalado y activado.', 'advanced-product-importer'); ?></p>
                </div>
                <?php
            });
        }
    }

    /**
     * Agregar menú en el admin
     */
    public function add_admin_menu() {
        add_menu_page(
            __('Importador Avanzado', 'advanced-product-importer'),
            __('Importador Avanzado', 'advanced-product-importer'),
            'manage_woocommerce',
            'advanced-product-importer',
            array($this, 'display_admin_page'),
            'dashicons-upload',
            58
        );
    }

    /**
     * Registrar estilos y scripts
     */
    public function enqueue_admin_assets($hook) {
        if ('toplevel_page_advanced-product-importer' !== $hook) {
            return;
        }

        // CSS
        wp_enqueue_style(
            'api-admin-style',
            API_PLUGIN_URL . 'assets/css/admin-style.css',
            array(),
            API_PLUGIN_VERSION
        );

        // JS
        wp_enqueue_script(
            'api-admin-script',
            API_PLUGIN_URL . 'assets/js/admin-script.js',
            array('jquery'),
            API_PLUGIN_VERSION,
            true
        );

        // Localizar script
        wp_localize_script(
            'api-admin-script',
            'API_Vars',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('api_nonce'),
                'categories' => $this->get_categories_array()
            )
        );
    }

    /**
     * Obtener array de categorías disponibles
     */
    private function get_categories_array() {
        return array(
            'portatiles' => 'Portatiles',
            'portatiles-gamer' => 'Portatiles Gamer',
            'celulares' => 'Celulares',
            'tablets' => 'Tablets',
            'disco-ssd' => 'Disco SSD',
            'disco-hdd' => 'Disco HDD',
            'televisores' => 'Televisores',
            'cctv' => 'CCTV',
            'servidores' => 'Servidores',
            'monitores' => 'Monitores'
        );
    }

    /**
     * Mostrar página de administración
     */
    public function display_admin_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('Importador Avanzado de Productos para WooCommerce', 'advanced-product-importer'); ?></h1>
            
            <div class="api-container">
                <div class="api-card">
                    <h2><?php _e('Importar Productos', 'advanced-product-importer'); ?></h2>
                    
                    <div class="api-form-group">
                        <label for="product_data"><?php _e('Datos del Producto (uno por línea)', 'advanced-product-importer'); ?></label>
                        <textarea id="product_data" rows="10" class="widefat" placeholder="ASUS VIVOBOOK 15.6&quot; FHD i3-1215U 16GB RAM 512GB M.2 NVME TECL ESPAÑOL + NUM FREEDOS BLUE X1504ZA-NJ1154 INCL MOCHILA Y MOUSE ASUS GARANTIA 12 MESES PINSOFT $441.60"></textarea>
                    </div>
                    
                    <button id="parse_products" class="button button-primary"><?php _e('Analizar Productos', 'advanced-product-importer'); ?></button>
                </div>
                
                <div id="products_preview" class="api-card api-hidden">
                    <h2><?php _e('Vista Previa de Productos', 'advanced-product-importer'); ?></h2>
                    <div id="products_table_container"></div>
                    <div class="api-actions">
                        <button id="import_products" class="button button-primary"><?php _e('Importar Productos', 'advanced-product-importer'); ?></button>
                        <button id="cancel_import" class="button"><?php _e('Cancelar', 'advanced-product-importer'); ?></button>
                    </div>
                </div>
                
                <div id="existing_products" class="api-card">
                    <h2><?php _e('Productos Existentes', 'advanced-product-importer'); ?></h2>
                    <div class="api-form-group">
                        <input type="text" id="search_products" class="widefat" placeholder="<?php _e('Buscar productos...', 'advanced-product-importer'); ?>">
                    </div>
                    <div id="existing_products_table_container"></div>
                    <div class="api-actions">
                        <button id="delete_selected" class="button button-secondary"><?php _e('Eliminar Seleccionados', 'advanced-product-importer'); ?></button>
                        <button id="refresh_products" class="button"><?php _e('Actualizar Lista', 'advanced-product-importer'); ?></button>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Procesar importación de productos (AJAX)
     */
    public function process_import() {
        // Verificar nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'api_nonce')) {
            wp_send_json_error(array('message' => 'Verificación de seguridad fallida'));
        }

        // Verificar permisos
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error(array('message' => 'No tienes permisos para realizar esta acción'));
        }

        // Obtener datos
        $products = isset($_POST['products']) ? json_decode(stripslashes($_POST['products']), true) : array();
        
        if (empty($products)) {
            wp_send_json_error(array('message' => 'No hay productos para importar'));
        }

        $results = array(
            'success' => array(),
            'error' => array()
        );

        foreach ($products as $product_data) {
            try {
                // Crear o actualizar producto
                $product_id = $this->create_or_update_product($product_data);
                
                if ($product_id) {
                    $results['success'][] = array(
                        'name' => $product_data['name'],
                        'id' => $product_id
                    );
                } else {
                    throw new Exception('Error al crear el producto');
                }
            } catch (Exception $e) {
                $results['error'][] = array(
                    'name' => $product_data['name'],
                    'message' => $e->getMessage()
                );
            }
        }

        wp_send_json_success($results);
    }

    /**
     * Crear o actualizar producto en WooCommerce
     */
    private function create_or_update_product($data) {
        // Comprobar si ya existe un producto con este SKU
        $existing_id = wc_get_product_id_by_sku($data['sku']);
        
        $product = new WC_Product_Simple();
        
        if ($existing_id) {
            $product = wc_get_product($existing_id);
        }
        
        // Establecer datos básicos
        $product->set_name($data['name']);
        $product->set_sku($data['sku']);
        $product->set_status($data['published'] ? 'publish' : 'draft');
        $product->set_featured($data['featured']);
        $product->set_catalog_visibility($data['visibility']);
        $product->set_short_description($data['short_description']);
        $product->set_description($data['description']);
        $product->set_manage_stock(true);
        $product->set_stock_quantity($data['stock'] ? 10 : 0); // Stock por defecto 10 si está disponible
        $product->set_stock_status($data['stock'] ? 'instock' : 'outofstock');
        
        // Dimensiones
        if (!empty($data['weight'])) {
            $product->set_weight($data['weight']);
        }
        if (!empty($data['length'])) {
            $product->set_length($data['length']);
        }
        if (!empty($data['width'])) {
            $product->set_width($data['width']);
        }
        if (!empty($data['height'])) {
            $product->set_height($data['height']);
        }
        
        // Valoraciones
        $product->set_reviews_allowed($data['reviews_allowed']);
        
        // Precio
        $product->set_regular_price($data['price']);
        
        // Guardar producto
        $product_id = $product->save();
        
        // Asignar categorías
        if (!empty($data['categories'])) {
            wp_set_object_terms($product_id, $data['categories'], 'product_cat');
        }
        
        // Asignar marca
        if (!empty($data['brand'])) {
            // Verificar si existe el término
            $term = term_exists($data['brand'], 'pa_marca');
            
            // Si no existe, crearlo
            if (!$term) {
                $term = wp_insert_term($data['brand'], 'pa_marca');
            }
            
            if (!is_wp_error($term)) {
                wp_set_object_terms($product_id, array($term['term_id']), 'pa_marca');
                
                // Establecer atributo visible
                $product_attributes = array(
                    'pa_marca' => array(
                        'name' => 'pa_marca',
                        'value' => $data['brand'],
                        'position' => 0,
                        'is_visible' => 1,
                        'is_variation' => 0,
                        'is_taxonomy' => 1
                    )
                );
                
                update_post_meta($product_id, '_product_attributes', $product_attributes);
            }
        }
        
        // Asignar imágenes
        if (!empty($data['images'])) {
            $attachment_ids = array();
            
            foreach ($data['images'] as $image_url) {
                $attachment_id = $this->upload_image_from_url($image_url, $product_id);
                if ($attachment_id) {
                    $attachment_ids[] = $attachment_id;
                }
            }
            
            if (!empty($attachment_ids)) {
                set_post_thumbnail($product_id, $attachment_ids[0]);
                
                // Imágenes adicionales
                if (count($attachment_ids) > 1) {
                    array_shift($attachment_ids); // Eliminar la primera que ya está como imagen principal
                    update_post_meta($product_id, '_product_image_gallery', implode(',', $attachment_ids));
                }
            }
        }
        
        return $product_id;
    }

    /**
     * Subir imagen desde URL
     */
    private function upload_image_from_url($url, $product_id) {
        // Verificar que la URL es válida
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return false;
        }
        
        // Obtener el contenido de la imagen
        $image_data = file_get_contents($url);
        
        if (!$image_data) {
            return false;
        }
        
        // Obtener el nombre del archivo de la URL
        $filename = basename(parse_url($url, PHP_URL_PATH));
        
        // Verificar que es una imagen con una extensión válida
        $valid_extensions = array('jpg', 'jpeg', 'png', 'gif');
        $ext = pathinfo($filename, PATHINFO_EXTENSION);
        
        if (!in_array(strtolower($ext), $valid_extensions)) {
            $filename = $filename . '.jpg'; // Agregar extensión si no tiene
        }
        
        // Cargar la imagen en WordPress
        $upload = wp_upload_bits($filename, null, $image_data);
        
        if ($upload['error']) {
            return false;
        }
        
        $wp_filetype = wp_check_filetype($filename, null);
        
        $attachment = array(
            'post_mime_type' => $wp_filetype['type'],
            'post_title' => sanitize_file_name($filename),
            'post_content' => '',
            'post_status' => 'inherit'
        );
        
        $attachment_id = wp_insert_attachment($attachment, $upload['file'], $product_id);
        
        if (!$attachment_id) {
            return false;
        }
        
        // Generar los tamaños de imagen
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        $attachment_data = wp_generate_attachment_metadata($attachment_id, $upload['file']);
        wp_update_attachment_metadata($attachment_id, $attachment_data);
        
        return $attachment_id;
    }

    /**
     * Buscar especificaciones técnicas (AJAX)
     */
    public function search_specifications() {
        // Verificar nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'api_nonce')) {
            wp_send_json_error(array('message' => 'Verificación de seguridad fallida'));
        }

        // Obtener datos
        $model = isset($_POST['model']) ? sanitize_text_field($_POST['model']) : '';
        $brand = isset($_POST['brand']) ? sanitize_text_field($_POST['brand']) : '';
        
        if (empty($model) || empty($brand)) {
            wp_send_json_error(array('message' => 'Se requiere el modelo y la marca'));
        }

        // Aquí iría la lógica para buscar en sitios oficiales
        // Por motivos de seguridad y para evitar problemas con APIs, sólo simularemos resultados
        
        $specs = $this->simulate_specs_search($brand, $model);
        
        wp_send_json_success($specs);
    }
    
    /**
     * Simular búsqueda de especificaciones (en producción se implementaría la búsqueda real)
     */
    private function simulate_specs_search($brand, $model) {
        // Ejemplo de especificaciones para un ASUS VIVOBOOK X1504ZA
        if (stripos($brand, 'asus') !== false && stripos($model, 'x1504za') !== false) {
            return array(
                'full_description' => '<h3>Especificaciones ASUS VIVOBOOK X1504ZA</h3>
                <ul>
                    <li><strong>Procesador:</strong> Intel Core i3-1215U (hasta 4.4 GHz, 6 núcleos, 8 threads)</li>
                    <li><strong>Sistema Operativo:</strong> FreeDOS</li>
                    <li><strong>Memoria:</strong> 16GB DDR4</li>
                    <li><strong>Almacenamiento:</strong> 512GB SSD NVMe PCIe</li>
                    <li><strong>Pantalla:</strong> 15.6" Full HD (1920 x 1080) Anti-glare</li>
                    <li><strong>Gráficos:</strong> Intel UHD Graphics</li>
                    <li><strong>Conectividad:</strong> Wi-Fi 6 (802.11ax) + Bluetooth 5.0</li>
                    <li><strong>Puertos:</strong> 1x USB 3.2 Gen 1 Type-C, 1x USB 3.2 Gen 1 Type-A, 2x USB 2.0 Type-A, 1x HDMI 1.4, 1x 3.5mm Combo Audio Jack</li>
                    <li><strong>Batería:</strong> 42Wh, 3 celdas</li>
                    <li><strong>Dimensiones:</strong> 35.98 x 23.53 x 1.79 ~ 1.79 cm</li>
                    <li><strong>Peso:</strong> 1.7 kg</li>
                    <li><strong>Color:</strong> Azul</li>
                    <li><strong>Características adicionales:</strong> Teclado numérico completo, Webcam HD</li>
                </ul>',
                'weight' => 1.7,
                'length' => 35.98,
                'width' => 23.53,
                'height' => 1.79,
                'images' => array(
                    'https://www.asus.com/media/global/gallery/olkrvktngvfm8nuu_setting_xxx_0_90_end_2000.png',
                    'https://www.asus.com/media/global/gallery/yzvbwqrzrvueowio_setting_xxx_0_90_end_2000.png'
                )
            );
        }
        
        // Si no hay datos específicos, devolver datos genéricos
        return array(
            'full_description' => '<p>No se encontraron especificaciones detalladas para este modelo. Por favor, ingresa la información manualmente.</p>',
            'weight' => '',
            'length' => '',
            'width' => '',
            'height' => '',
            'images' => array()
        );
    }

    /**
     * Obtener productos existentes (AJAX)
     */
    public function get_existing_products() {
        // Verificar nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'api_nonce')) {
            wp_send_json_error(array('message' => 'Verificación de seguridad fallida'));
        }

        // Verificar permisos
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error(array('message' => 'No tienes permisos para realizar esta acción'));
        }

        // Parámetros de búsqueda
        $search = isset($_POST['search']) ? sanitize_text_field($_POST['search']) : '';
        $paged = isset($_POST['page']) ? absint($_POST['page']) : 1;
        $per_page = 20;

        // Argumentos de búsqueda
        $args = array(
            'status' => array('publish', 'draft'),
            'limit' => $per_page,
            'page' => $paged,
            'orderby' => 'date',
            'order' => 'DESC',
            'return' => 'ids'
        );
        
        if (!empty($search)) {
            $args['s'] = $search;
        }

        // Obtener productos
        $products_query = new WC_Product_Query($args);
        $product_ids = $products_query->get_products();
        
        $total_products = wc_get_products(array_merge($args, array('return' => 'ids', 'paginate' => true)));
        $total_pages = ceil($total_products->total / $per_page);

        $products = array();
        
        foreach ($product_ids as $product_id) {
            $product = wc_get_product($product_id);
            
            $products[] = array(
                'id' => $product_id,
                'name' => $product->get_name(),
                'sku' => $product->get_sku(),
                'price' => $product->get_price(),
                'stock' => $product->get_stock_quantity(),
                'status' => $product->get_status(),
                'image' => $product->get_image('thumbnail'),
                'edit_url' => get_edit_post_link($product_id)
            );
        }

        wp_send_json_success(array(
            'products' => $products,
            'pagination' => array(
                'current_page' => $paged,
                'total_pages' => $total_pages,
                'total_items' => $total_products->total
            )
        ));
    }

    /**
     * Eliminar productos seleccionados (AJAX)
     */
    public function delete_products() {
        // Verificar nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'api_nonce')) {
            wp_send_json_error(array('message' => 'Verificación de seguridad fallida'));
        }

        // Verificar permisos
        if (!current_user_can('manage_woocommerce')) {
            wp_send_json_error(array('message' => 'No tienes permisos para realizar esta acción'));
        }

        // Obtener IDs
        $product_ids = isset($_POST['product_ids']) ? array_map('absint', $_POST['product_ids']) : array();
        
        if (empty($product_ids)) {
            wp_send_json_error(array('message' => 'No hay productos seleccionados para eliminar'));
        }

        $results = array(
            'success' => array(),
            'error' => array()
        );

        foreach ($product_ids as $product_id) {
            $product = wc_get_product($product_id);
            
            if ($product) {
                $name = $product->get_name();
                $result = $product->delete(true);
                
                if ($result) {
                    $results['success'][] = array(
                        'id' => $product_id,
                        'name' => $name
                    );
                } else {
                    $results['error'][] = array(
                        'id' => $product_id,
                        'name' => $name,
                        'message' => 'Error al eliminar el producto'
                    );
                }
            } else {
                $results['error'][] = array(
                    'id' => $product_id,
                    'message' => 'Producto no encontrado'
                );
            }
        }

        wp_send_json_success($results);
    }
}

// Iniciar el plugin
function run_advanced_product_importer() {
    new Advanced_Product_Importer();
}
add_action('plugins_loaded', 'run_advanced_product_importer');
