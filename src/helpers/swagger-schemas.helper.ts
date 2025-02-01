import { OpenAPIParam } from 'routing-controllers-openapi';

import { InvoiceStatus } from 'common/enums/invoice-status.enum';
import { OrderStatus } from 'common/enums/order-status.enum';
import { ResultMessage } from 'common/enums/result-message.enum';
import { Roles } from 'common/enums/roles.enum';

export const getSchemasList = () => ({
  UserDto: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        example: 1
      },
      firstName: {
        type: 'string',
        example: 'John'
      },
      lastName: {
        type: 'string',
        example: 'Doe'
      },
      email: {
        type: 'string',
        example: 'john.doe@example.com'
      },
      role: {
        $ref: '#/components/schemas/RoleDto'
      }
    }
  },
  RoleDto: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        example: 1
      },
      name: {
        type: 'string',
        example: 'Admin'
      }
    }
  }
});

export const swaggerSchemas = {
  auth: {
    signin: {
      summary: 'User Sign-in',
      description: 'Authenticate a user with email and password',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SigninArgs' }
          }
        }
      },
      responses: {
        200: {
          description: 'Successful login',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  accessToken: { type: 'string' },
                  payload: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer' },
                      email: { type: 'string' }
                    }
                  },
                  results: { type: 'string', enum: ['SUCCEED', 'FAILED'] }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized'
        }
      }
    } as OpenAPIParam,
    signout: {
      summary: 'Sign out',
      description: 'Sign out a user from the system',
      parameters: [
        {
          name: 'authorization',
          in: 'header',
          required: true,
          description: 'Access token for authentication',
          schema: {
            type: 'string',
            example: 'Bearer <access_token>'
          }
        }
      ],
      responses: {
        200: {
          description: 'Successfully signed out',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'You have been signed out successfully.'
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - Invalid token'
        }
      }
    } as OpenAPIParam
  },
  healthcheck: {
    healthcheck: {
      summary: 'Health Check',
      description: 'Checks the health status of various services (DB, Redis, RabbitMQ).',
      responses: {
        200: {
          description: 'Health check response',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', enum: ['OK', 'FAIL'] },
                  uptime: { type: 'number', description: 'Server uptime in seconds' },
                  timestamp: { type: 'number', description: 'Current timestamp in milliseconds' },
                  redis: { type: 'string', enum: ['healthy', 'unhealthy'] },
                  rabbitMQ: { type: 'string', enum: ['healthy', 'unhealthy'] },
                  db: { type: 'string', enum: ['healthy', 'unhealthy'] }
                }
              }
            }
          }
        }
      }
    } as OpenAPIParam
  },
  invoices: {
    getInvoicesList: {
          summary: 'GET Invoice List',
          description: 'Returns a list of invoices',
          responses: {
            200: {
              description: 'Successful response with invoice list',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      payloads: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'number' },
                            title: { type: 'string' },
                            amount: { type: 'number' },
                            description: { type: 'string' },
                            status: { type: 'string', enum: Object.values(InvoiceStatus) }
                          }
                        }
                      },
                      total: { type: 'number' },
                      result: { type: 'string', enum: Object.values(ResultMessage) }
                    }
                  }
                }
              }
            }
          }
    } as OpenAPIParam
  },
  orders: {
    getOrdersList: {
      summary: 'GET Order List',
      description: 'Returns a list of orders',
      responses: {
        200: {
          description: 'Successful response with order list',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  payloads: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        totalAmount: { type: 'number' },
                        status: { type: 'string', enum: Object.values(OrderStatus) }
                      }
                    }
                  },
                  total: { type: 'number' },
                  result: { type: 'string', enum: Object.values(ResultMessage) }
                }
              }
            }
          }
        }
      }
    } as OpenAPIParam,
    createOrder: {
      summary: 'Create a Order',
      description: 'Create a new order with the provided information.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateOrderArgs'
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Order created successfully.'
        },
        400: {
          description: 'Bad request, invalid data.'
        }
      }
    } as OpenAPIParam,
    approveOrder: {
      summary: 'Approve the Order',
      description: 'Approve order with the provided information.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Order ID to approve',
          schema: {
            type: 'integer',
            example: 1
          }
        }
      ],
      responses: {
        201: {
          description: 'Order approved successfully.'
        },
        400: {
          description: 'Bad request, invalid data.'
        }
      }
    } as OpenAPIParam,
    cancelOrder: {
      summary: 'Cancel the Order',
      description: 'Cancel order with the provided information.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Order ID to cancel',
          schema: {
            type: 'integer',
            example: 1
          }
        }
      ],
      responses: {
        201: {
          description: 'Order canceled successfully.'
        },
        400: {
          description: 'Bad request, invalid data.'
        }
      }
    } as OpenAPIParam
  },
  roles: {
    getRolesList: {
      summary: 'GET Role List',
      description: 'Returns a list of roles',
      responses: {
        200: {
          description: 'Successful response with role list',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  payloads: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        name: { type: 'string', enum: Object.values(Roles) }
                      }
                    }
                  },
                  total: { type: 'number' },
                  result: { type: 'string', enum: Object.values(ResultMessage) }
                }
              }
            }
          }
        }
      }
    } as OpenAPIParam
  },
  users: {
    getUserList: {
      summary: 'GET User List',
      description: 'Returns a list of users with role details',
      responses: {
        200: {
          description: 'Successful response with user list',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  payloads: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        email: { type: 'string' },
                        role: {
                          type: 'object',
                          properties: {
                            id: { type: 'number' },
                            name: { type: 'string', enum: Object.values(Roles) }
                          }
                        }
                      }
                    }
                  },
                  total: { type: 'number' },
                  result: { type: 'string', enum: Object.values(ResultMessage) }
                }
              }
            }
          }
        }
      }
    } as OpenAPIParam,
    getUserBy: {
      summary: 'Get User by ID',
      description: 'Fetch a user by their ID.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'User ID to fetch the user data',
          schema: {
            type: 'integer',
            example: 1
          }
        }
      ],
      responses: {
        200: {
          description: 'User found successfully.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserDto'
              }
            }
          }
        },
        404: {
          description: 'User not found.'
        }
      }
    } as OpenAPIParam,
    createUser: {
      summary: 'Create a User',
      description: 'Create a new user with the provided information.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateUserArgs'
            }
          }
        }
      },
      responses: {
        201: {
          description: 'User created successfully.'
        },
        400: {
          description: 'Bad request, invalid data.'
        }
      }
    } as OpenAPIParam,
    updateUser: {
      summary: 'Update a User',
      description: 'Update the details of an existing user.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'User ID to update',
          schema: {
            type: 'integer',
            example: 1
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateUserArgs'
            }
          }
        }
      },
      responses: {
        200: {
          description: 'User updated successfully.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserDto'
              }
            }
          }
        },
        404: {
          description: 'User not found.'
        },
        400: {
          description: 'Bad request, invalid data.'
        }
      }
    } as OpenAPIParam,
    updatePassword: {
      summary: 'Update User Password',
      description: 'Update the password for a specific user.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'User ID to update password',
          schema: {
            type: 'integer',
            example: 1
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateUserPasswordArgs'
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Password updated successfully.'
        },
        400: {
          description: 'Bad request, invalid data.'
        },
        404: {
          description: 'User not found.'
        }
      }
    } as OpenAPIParam,
    deleteUser: {
      summary: 'Delete a User',
      description: 'Delete a user by their ID.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'User ID to delete',
          schema: {
            type: 'integer',
            example: 1
          }
        }
      ],
      responses: {
        200: {
          description: 'User deleted successfully.'
        },
        404: {
          description: 'User not found.'
        }
      }
    } as OpenAPIParam
  }
};
