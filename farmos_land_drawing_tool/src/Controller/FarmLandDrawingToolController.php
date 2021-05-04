<?php

namespace Drupal\farmos_land_drawing_tool\Controller;

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
   * @param \Drupal\Core\State\State $state
   *          The object State.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   */
  public function __construct(RequestStack $request_stack, ConfigFactoryInterface $config_factory,
    AccountProxyInterface $currentUser) {
    $this->requestStack = $request_stack;
    $this->configFactory = $config_factory;
    $this->currentUser = $currentUser;
  }

  /**
   * Top-level handler for demo page requests.
   */
  public function content() {
    // Get the system of measurement to populate drupalSettings.farm_map.units.
    $measurement = $this->configFactory->get('quantity.settings')->get('system_of_measurement');

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
        ],
      ],
    ];
  }

}
