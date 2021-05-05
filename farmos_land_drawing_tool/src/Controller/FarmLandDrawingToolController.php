<?php

namespace Drupal\farmos_land_drawing_tool\Controller;

use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Session\AccountProxyInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;

/**
 * Defines FarmLandDrawingToolController class.
 */
class FarmLandDrawingToolController extends ControllerBase {

  /**
   * The request stack.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  protected $requestStack;

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The entity field manager.
   *
   * @var \Drupal\Core\Entity\EntityFieldManagerInterface
   */
  protected $entityFieldManager;

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;


  /**
   * Constructs a new FarmLandDrawingToolController object.
   *
   * @param \Symfony\Component\HttpFoundation\RequestStack $request_stack
   *          The request stack.
   * @param \Drupal\Core\Config\ConfigFactoryInterface
   *          The config factory.
   * @param \Drupal\Core\Entity\EntityFieldManagerInterface
   *          The entity field manager.
   * @param \Drupal\Core\Session\AccountProxyInterface
   *          The current user.
   */
  public function __construct(RequestStack $request_stack, ConfigFactoryInterface $config_factory,
    EntityFieldManagerInterface $entity_field_manager, AccountProxyInterface $currentUser) {
    $this->requestStack = $request_stack;
    $this->configFactory = $config_factory;
    $this->entityFieldManager = $entity_field_manager;
    $this->currentUser = $currentUser;
  }

  /**
   * Top-level handler for demo page requests.
   */
  public function content() {
    // Get the system of measurement to populate drupalSettings.farm_map.units.
    $measurement = $this->configFactory->get('quantity.settings')->get('system_of_measurement');

    $landAssetFields = $this->entityFieldManager->getFieldDefinitions('asset', 'land');

    // Get the valid land type options
    $validLandTypes = options_allowed_values($landAssetFields['land_type']);

    return [
      '#markup' => '<div id="farm-land-drawing-tool-app"></div>',
      '#attached' => [
        'library' => [
          'farmos_land_drawing_tool/farmos_land_drawing_tool'
        ],
        'drupalSettings' => [
          'farm_map' => [
            units => $measurement,
          ],
          'farmos_land_drawing_tool' => [
            'land_type_options' => $validLandTypes,
          ],
        ],
      ],
    ];
  }

}
