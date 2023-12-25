'use strict';

const LOCAL_STORAGE_KEY_PREFIX = 'tt-extension-';

async function httpGet(url) {
  const rsp = await fetch(url);
  return await rsp.json();
}

async function httpPost(url, body) {
  const rsp = await fetch(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (rsp.headers.get('Content-Type') === 'application/json') {
    return await rsp.json();
  }
  return;
}

async function httpPatch(url, body) {
  const rsp = await fetch(url, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (rsp.headers.get('Content-Type') === 'application/json') {
    return await rsp.json();
  }
  return;
}

const collectionsOperators = {};
let openComponent = undefined;

let apiExtensionData;

function generateTemplateConfiguration(configurationDefinition) {
  // generate a template configuration
  const requiredFields = configurationDefinition.fields.filter((field) => field.required) ?? [];
  const generatedConfiguration = {};
  for (const field of requiredFields) {
    if (field.default) {
      generatedConfiguration[field.attribute] = field.default;
    } else if (field.type === 'text') {
      generatedConfiguration[field.attribute] = '';
    } else if (field.type === 'number') {
      generatedConfiguration[field.attribute] = 1;
    } else if (field.type === 'boolean') {
      generatedConfiguration[field.attribute] = true;
    } else {
      generatedConfiguration[field.attribute] = {};
    }
  }
  return generatedConfiguration;
}

function renderComponent() {
  try {
    if (openComponent.renderableReturn && openComponent.renderableReturn.unmount) {
      openComponent.renderableReturn.unmount();
    }
    openComponent.renderableReturn = undefined;

    // Validate the configuration
    const configuration = JSON.parse(document.querySelector('#components-container textarea').value);

    if (openComponent.definedComponent.configuration) {
      const missingRequiredAttributes = [];
      const configurationDefinition = openComponent.definedComponent.configuration;
      const requiredFields = configurationDefinition.fields.filter((field) => field.required) ?? [];
      for (const field of requiredFields) {
        if (configuration[field.attribute] === undefined) {
          missingRequiredAttributes.push(field.attribute);
        }
      }

      if (missingRequiredAttributes.length > 0) {
        alert(
          `The following required attributes are missing from the configuration: ${missingRequiredAttributes.join(
            ', '
          )}`
        );
        return;
      }
    }

    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${openComponent.componentName}`, JSON.stringify(configuration));

    const element = document.querySelector('#components-container .component');
    openComponent.renderableReturn = openComponent.renderer(element, { ...openComponent.basicProps, ...configuration });
  } catch (error) {
    alert(`Failed to parse configuration ${error}.`);
  }
}

function createMockTeletronWebStart(extensionName) {
  const components = [];

  return function (requestedExtension) {
    if (requestedExtension !== extensionName) {
      throw new Error(
        `Requested extension ${requestedExtension} does not match the expected extension name ${extensionName}.`
      );
    }

    const httpPrefix = `/extensions/${extensionName}`;
    return {
      messages: {
        dispatch: function (...args) {
          console.log('MESSAGES.DISPATCH', args);
        },
        subscribe: function (...args) {
          console.log('MESSAGES.SUBSCRIBE', args);
          return [
            function (...args) {
              console.log('DISPATCH', args);
            },
          ];
        },
      },
      http: {
        PREFIX: httpPrefix,
        get: async (url) => {
          return await httpGet(`${httpPrefix}${url}`);
        },
      },
      registerComponent: function (componentName, renderer) {
        const definedComponent = apiExtensionData.components.find((component) => component.name === componentName);
        if (!definedComponent) {
          alert(`Component ${componentName} is not registered in the extension.`);
          return;
        }
        components.push({ componentName, renderer });

        const button = document.createElement('button');
        button.innerText = `Component: ${definedComponent.displayName ?? componentName}`;
        button.addEventListener('click', () => {
          document.querySelector('#components-container .close').innerHTML = `Close ${componentName}`;
          document.querySelector('#components-container').classList.remove('hidden');

          if (localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${componentName}`)) {
            document.querySelector('#components-container textarea').value = JSON.stringify(
              JSON.parse(localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${componentName}`)),
              '\t',
              2
            );
          } else {
            const generatedConfiguration = definedComponent.configuration
              ? generateTemplateConfiguration(definedComponent.configuration)
              : {};
            document.querySelector('#components-container textarea').value = JSON.stringify(
              generatedConfiguration,
              '\t',
              2
            );
          }

          openComponent = {
            componentName,
            renderer,
          };

          const basicProps = {
            componentType: componentName,
            componentId: 'stub-id',
            view: {}, // TODO fill in a view
            webStart: {
              collections: collectionsOperators,
              proxyQuery: () => {
                throw new Error('Proxy query not implemented.');
              },
              http: {
                PREFIX: httpPrefix,
                get: async (path) => httpGet(`${httpPrefix}${path}`),
                post: async (path, data) => httpPost(`${httpPrefix}${path}`, data),
              },
            },
          };
          openComponent.basicProps = basicProps;
          openComponent.definedComponent = definedComponent;

          renderComponent();
        });
        document.getElementById('components').appendChild(button);
      },
    };
  };
}

void (async function () {
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#components-container .close').addEventListener('click', function () {
      document.querySelector('#components-container').classList.add('hidden');
      if (openComponent) {
        if (openComponent.renderableReturn && openComponent.renderableReturn.unmount) {
          openComponent.renderableReturn.unmount();
        }
        openComponent = undefined;
      }
      document.querySelector('#components-container .component').innerHTML = '';
    });

    document.querySelector('#components-container .update').addEventListener('click', function () {
      try {
        // Validate the configuration
        const configuration = JSON.parse(document.querySelector('#components-container textarea').value);
        renderComponent();
      } catch (error) {
        alert(`Failed to parse configuration ${error}.`);
      }
    });
  });

  const extensionList = await httpGet('/api/extensions');
  const extension = extensionList[0];

  apiExtensionData = extension;

  window.teletronRegisterExtension = createMockTeletronWebStart(extension.name);

  if (extension.collections) {
    const collectionsResponse = await httpGet('/api/collections');

    const extensionCollections = collectionsResponse.data[`/${extension.name}`];
    if (extensionCollections) {
      for (const collection of extensionCollections) {
        collectionsOperators[collection.name] = {
          get: async (query) => {
            const response = await httpGet(`${collection.endpoint}?${query}`);
            return response.data;
          },
          create: async (item) => {
            const response = httpPost(collection.endpoint, item);
            return response.data;
          },
          update: async (id, item) => {
            const response = await update(`${collection.endpoint}/${id}`, item);
            return response.data;
          },
        };
      }
    }
  }

  for (const asset of extension.assets) {
    // get the extension and if it's js, insert as a script tag. If it's css, insert as a link tag.
    const fileExtension = asset.split('.').pop();
    const url = `/extensions/${extension.name}/assets/${asset}`;
    if (fileExtension === 'js') {
      const script = document.createElement('script');
      script.src = url;
      document.head.appendChild(script);
    } else if (fileExtension === 'css') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
    }
  }
})();
