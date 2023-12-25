'use strict';

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
  return await rsp.json();
}

async function httpPatch(url, body) {
  const rsp = await fetch(url, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await rsp.json();
}

const collectionsOperators = {};
let openComponent = undefined;

function renderComponent() {
  try {
    if (openComponent.renderableReturn && openComponent.renderableReturn.unmount) {
      openComponent.renderableReturn.unmount();
    }
    openComponent.renderableReturn = undefined;

    // Validate the configuration
    const configuration = JSON.parse(document.querySelector('#components-container textarea').value);

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
        components.push({ componentName, renderer });

        const button = document.createElement('button');
        button.innerText = `Component: ${componentName}`;
        button.addEventListener('click', () => {
          document.querySelector('#components-container .close').innerHTML = `Close ${componentName}`;
          document.querySelector('#components-container').classList.remove('hidden');

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
