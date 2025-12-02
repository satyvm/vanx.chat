---
url: /docs/troubleshoot/server/two-factor-stopped-working.md
description: >-
  Fix two-factor authentication failures in Coolify by synchronizing server time
  with NTP, checking systemd-timesyncd, and configuring firewall port 123
  access.
---

# 2FA Stopped Working

It is usually a time synchronization issue.

## Diagnosis

* Check your server's time with `date` - if the time is off, you need to synchronize it.
* Check your NTP configuration with `cat /etc/ntp.conf`.
* Check with `systemctl status systemd-timesyncd.service` if your operating system is using systemd to synchronize time.
* Check your firewall (`ufw`, `iptables`) rules to see if you have any rules that block time synchronization ports (`123/udp, 123/tcp`).

## Solution

* If your operating system is using systemd, you can synchronize the time with `sudo timedatectl set-ntp true`.
* If your operating system is not using systemd, you can synchronize the time with `sudo ntpdate ntp.ubuntu.com`.

---

---
url: /docs/knowledge-base/cloudflare/tunnels/all-resource.md
description: >-
  Expose all Coolify resources securely through Cloudflare Tunnels without
  public IPs or port forwarding using wildcard domains and HTTP proxy routing.
---

# Access All Resource via Cloudflare Tunnels

Accessing All Resource deployed on Coolify using a Cloudflare Tunnel allows you to securely reach your app without exposing your serverâ€™s IP address or without having a Public IP address for the server.

## Who this is for?

This setup is ideal for people who:

* Don't have a public IP for their server (could be a laptop, rasberry pi etc..).
* Are unable to port forward (e.g., using home internet or on a private network).
* Want to keep their serverâ€™s IP address private and avoid exposing it to the public internet.
* Have an resource already deployed on Coolify and need an external method to access it securely.

## Setup Requirements

To follow this guide, you'll need:

* A free [Cloudflare](https://cloudflare.com) account.
* You need a domain that has it's **DNS managed by Cloudflare**.

## Before We Start

* We assume you have Coolify running on your server.
* If your app requires HTTPS for functionality like cookies or login, then you need to follow the [Full TLS HTTPS guide](/knowledge-base/cloudflare/tunnels/full-tls) after following this guide. This is because in this guide, Cloudflare will manage HTTPS externally, while your app will run over HTTP within Coolify.

## How It Works?

A simple high-level overview diagram to give you a visual idea of how this works:

***

### Quick Links to Important Sections:

* [Create a Cloudflare Tunnel](#_1-create-a-cloudflare-tunnel)
* [Setup Encryption mode on Cloudflare](#_2-setup-encryption-mode-on-cloudflare)
* [Setup Cloudflare Tunnel on Coolify](#_3-setup-cloudflare-tunnel-on-coolify)
* [Start Coolify Proxy](#_4-start-coolify-proxy)
* [Configure Your Resource to Use the Tunnel Domain](#_5-configure-your-resource-to-use-the-tunnel-domain)
* [How to use Mutiple Different Domains](#how-to-use-mutiple-different-domains)
* [Known issues and Solutions](#known-issues-and-solutions)

***

::: warning Example Data
The following data is used as an example in this guide. Please replace it with your actual data when following the steps:

* **Domain Name:** shadowarcanist.com
  :::

***

## 1. Create a Cloudflare Tunnel

To create a Cloudflare Tunnel, first log in to your Cloudflare account and go to the [Zero Trust](https://one.dash.cloudflare.com/) page.

1. On the Zero Trust page, go to **Networks** in the sidebar.
2. Click on **Tunnels**
3. Click on **Add a tunnel** button

You will be prompted to choose a tunnel type. Click the **Select Cloudflared** button.

You will be prompted to enter a tunnel name. Choose a name that you prefer.

Next you will see the configuration page with multiple options to install cloudflared.

Copy the install command, which contains the token for your tunnel (token starts with "eyJ"). Make sure to save only the token, removing the command part before it, and store it in a safe place, as we need it later.

Scroll down until you see the **Next** button, then click it.

Then, you will be prompted to add a hostname.

1. **Subdomain** - (Optional) You can make your all of your resource accessible on any subdomain/domain. For this guide, we are using a wildcard subdomain.
2. **Domain** - Choose the domain you want to use for the tunnel.
3. **Path** - Leave this field empty.
4. **Type** - Choose **HTTP** (this is very important).
5. **URL** - Enter **localhost:80** (this is very important).
6. After filling in the details, click the **Save Tunnel** button.

## 2. Setup Encryption mode on Cloudflare

To set up encryption on Cloudflare, follow these steps:

1. Go to **SSL/TLS** in Cloudflare.
2. Select **Overview**.
3. Click **Configure** button

Choose **Full** as the encryption mode.

## 3. Setup Cloudflare Tunnel on Coolify

To set up the tunnel on Coolify, follow these steps:

Go to your project on Coolify dashboard and click the **+ New** button to create a new resource.

You will see many options to deploy a new app. Search for Cloudflared and click on it.

Go to the **Environment Variables** page, enter your tunnel token, and deploy the Cloudflared app. This token was copied in [Step 1](#_1-create-a-cloudflare-tunnel)

## 4. Start Coolify Proxy

To start the Coolify proxy, follow these steps:

1. In the Coolify dashboard, go to the **Servers** page from the sidebar.
2. Select the server where coolify is running, then Click on the **Proxy** tab.
3. Open the **General** tab.
4. Click the **Start Proxy** button.

::: success Tip\
The Coolify proxy is used to route traffic to apps running on your server. This eliminates the need to create new hostnames on the Cloudflare tunnel every time you deploy a new app.\
:::

## 5. Configure Your Resource to Use the Tunnel Domain

Enter the domain you want to use for your resource/app and deploy your resource.

::: warning HEADS UP!\
You should enter the domain as **HTTP** because Cloudflare handles **HTTPS** and TLS terminations. If you use **HTTPS** for your resource, you may encounter a **TOO\_MANY\_REDIRECTS** error.

If your app requires **HTTPS** for features like cookies or login, follow the [Full TLS HTTPS Guide](/knowledge-base/cloudflare/tunnels/full-tls) after completing this guide.\
:::

**Congratulations**! You've successfully set up a resource that can be accessed by anyone on the internet your domain.

## How to use Mutiple Different Domains?

You don't need to create new tunnels for each domain, just create a new hostname with the new domain and point it to the `localhost:80`.

## Known issues and Solutions

When you create a new public hostname in [Step 1](#_1-create-a-cloudflare-tunnel), Cloudflare will create a DNS record for the hostname.

However, if a DNS record for the hostname already exists, Cloudflare wonâ€™t create a new one.

In this case, your app wonâ€™t work. To fix this issue, follow the steps below:

First, copy your tunnel ID from the Tunnels page on the Cloudflare dashboard.

Create a new DNS record with the following details:

1. In the Cloudflare dashboard, go to **DNS**.
2. Select **Records**.
3. Add a **CNAME** record.
4. Enter the name as `*` or the name of your subdomain (this should match the hostname you have for your app on the tunnel).
5. For the **Target**, enter the tunnel ID followed by `.cfargotunnel.com`
6. Set the proxy status to **Proxied**.

Now, visit the domain of your application, and it should be accessible there.

---

---
url: /docs/knowledge-base/cloudflare/tunnels/single-resource.md
description: >-
  Securely access individual Coolify applications through Cloudflare Tunnels
  with port mapping, domain configuration, and multi-resource tunneling support.
---

# Access Single Resource via Cloudflare Tunnels

Accessing an Resource deployed on Coolify using a Cloudflare Tunnel allows you to securely reach your app without exposing your serverâ€™s IP address or without having a Public IP address for the server.

## Who this is for?

This setup is ideal for people who:

* Don't have a public IP for their server (could be a laptop, rasberry pi etc..).
* Are unable to port forward (e.g., using home internet or on a private network).
* Want to keep their serverâ€™s IP address private and avoid exposing it to the public internet.
* Have an app already deployed on Coolify and need an external method to access it securely.

## Setup Requirements

To follow this guide, you'll need:

* A free [Cloudflare](https://cloudflare.com) account.
* You need a domain that has it's **DNS managed by Cloudflare**.
* Your Resource has to be deployed and managed with Coolify.

## Before We Start

* We assume you have Coolify running and an app already deployed.
* If your app requires HTTPS for functionality like cookies or login, then you need to follow the [Full TLS HTTPS guide](/knowledge-base/cloudflare/tunnels/full-tls) after following this guide. This is because in this guide, Cloudflare will manage HTTPS externally, while your app will run over HTTP within Coolify.

## How It Works?

A simple high-level overview diagram to give you a visual idea of how this works:

***

### Quick Links to Important Sections:

* [Setup your app for tunneling](#_1-setup-your-app-for-tunneling)
* [Create a Cloudflare Tunnel](#_2-create-a-cloudflare-tunnel)
* [Setup Cloudflare Tunnel on Coolify](#_3-setup-cloudflare-tunnel-on-coolify)
* [Expose Mutiple Resource on Different Domains](#expose-mutiple-resource-on-different-domains)
* [Known issues and Solutions](#known-issues-and-solutions)

***

::: warning Example Data
The following data is used as an example in this guide. Please replace it with your actual data when following the steps:

* **Domain Name:** shadowarcanist.com
* **Ports Exposes:** 80
* **Ports Mapping:** 4477:80
  :::

***

## 1. Setup your app for tunneling

To setup your app for tunneling, follow these steps:

1. Remove all domains from the **Domains** field.
2. Set the correct port in **Ports Exposed** (the port your app uses).
3. Set the correct ports in **Port Mappings** (left is the host port, right is the app port).
4. Deploy your app by clicking the **Deploy** button.

## 2. Create a Cloudflare Tunnel

To create a Cloudflare Tunnel, first log in to your Cloudflare account and go to the [Zero Trust](https://one.dash.cloudflare.com/) page.

1. On the Zero Trust page, go to **Networks** in the sidebar.
2. Click on **Tunnels**
3. Click on **Add a tunnel** button

You will be prompted to choose a tunnel type. Click the **Select Cloudflared** button.

You will be prompted to enter a tunnel name. Choose a name that you prefer.

Next you will see the configuration page with multiple options to install cloudflared.

Copy the install command, which contains the token for your tunnel (token starts with "eyJ"). Make sure to save only the token, removing the command part before it, and store it in a safe place, as we need it later.

Scroll down until you see the **Next** button, then click it.

Then, you will be prompted to add a hostname.

1. **Subdomain** - (Optional) You can make your app/resource accessible on any subdomain/domain. For this guide, we are not using a subdomain.
2. **Domain** - Choose the domain you want to use for the tunnel.
3. **Path** - Leave this field empty.
4. **Type** - Choose **HTTP** (this is very important).
5. **URL** - Enter **localhost:4477** The port 4477 is the one we mapped to the host system in [Step 1](#_1-setup-your-app-for-tunneling). Replace 4477 with your own port.
6. After filling in the details, click the **Save Tunnel** button.

## 3. Setup Cloudflare Tunnel on Coolify

To set up the tunnel on Coolify, follow these steps:

Go to your project on Coolify dashboard and click the **+ New** button to create a new resource.

You will see many options to deploy a new app. Search for Cloudflared and click on it.

Go to the **Environment Variables** page, enter your tunnel token, and deploy the Cloudflared app. This token was copied in [Step 2](#_2-create-a-cloudflare-tunnel)

**Congratulations**! You've successfully set up a resource that can be accessed by anyone on the internet your domain.

:::danger HEADS UP!
**The steps above show how to tunnel a single resource. Below are the steps for tunneling multiple resources**
:::

## Tunnel Multiple Resources

The easiest way to tunnel multiple resources is by following our [Tunnel All Resources](/knowledge-base/cloudflare/tunnels/all-resource) guide, which uses Coolify's built-in proxy. However, if you prefer not to use the proxy, there are two alternative methods:

* [Tunnel Multiple Single Resources](#tunnel-multiple-single-resources)
* [Tunnel Coolify](#tunnel-coolify)

Tunneling multiple single resources is straightforward, but tunneling Coolify itself requires additional manual setup.

## Tunnel Multiple Single Resources

If you want to expose different apps individually, you can follow our [Tunnel All Resources](/knowledge-base/cloudflare/tunnels/all-resource), or take an alternate approach:

1. Follow [Step 1](#_1-setup-your-app-for-tunneling) for your new resource.
2. Create a new public hostname on Cloudflare Tunnel as described in [Step 2](#_2-create-a-cloudflare-tunnel).

Thereâ€™s no need to create a separate tunnel for each resources, simply create a new hostname and point it to the port your app is listening on.

## Tunnel Coolify

Tunneling Coolify itself to make it accessible over a domain requires a bit more manual configuration. Here's how you can set it up:

### 1. Create Public Hostnames in Cloudflare Tunnel

Follow [Step 2](#_2-create-a-cloudflare-tunnel) from the main guide to create public hostnames for each service Coolify exposes. Use the following mapping:

* **Hostnames**:

  1. `app.shadowarcanist.com/terminal/ws` â†’ `localhost:6002` (WebSocket terminal)
  2. `realtime.shadowarcanist.com` â†’ `localhost:6001` (Realtime server)
  3. `app.shadowarcanist.com` â†’ `localhost:8000` (Coolify dashboard)

* **Type**: HTTP (Ensure you select HTTP for each hostname.)

::: warning HEADS UP!
The order of the hostnames matters! Be sure to match it exactly as shown above.
:::

***

### 2. Update Coolifyâ€™s `.env` File

After creating public hostnames, update the `.env` file in your Coolify instance located at `/data/coolify/source` to enable connections to the realtime server. Add the following lines:

```bash
APP_ID=<random string>
APP_KEY=<random string>
APP_NAME=Coolify
DB_PASSWORD=<random string>
PUSHER_APP_ID=<random string>
PUSHER_APP_KEY=<random string>
PUSHER_APP_SECRET=<random string>
REDIS_PASSWORD=<random string>

###########
# Add these lines
PUSHER_HOST=realtime.shadowarcanist.com
PUSHER_PORT=443
###########
```

This ensures that Coolify uses the Cloudflare Tunnel for its realtime server.

### 3. Restart Coolify

Run the following command to restart Coolify and apply the changes:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

### 4. Verify the Setup

1. Access your Coolify dashboard at `https://app.shadowarcanist.com`.
2. Test the realtime functionality by visiting `https://app.shadowarcanist.com/realtime` in another browser tab. You should see a notification about a test event.
3. If you know what are you doing, you can check the network tab as well. Search for a websocket connection.

::: warning HEADS UP!
If you use a firewall, ensure that the required ports (e.g., `8000`, `6001`, `6002`) are open for internal communication but not exposed to the public internet.\
:::

## Known issues and Solutions

When you create a new public hostname in [Step 2](#_2-create-a-cloudflare-tunnel), Cloudflare will create a DNS record for the hostname.

However, if a DNS record for the hostname already exists, Cloudflare wonâ€™t create a new one.

In this case, your app wonâ€™t work. To fix this issue, follow the steps below:

First, copy your tunnel ID from the Tunnels page on the Cloudflare dashboard.

Create a new DNS record with the following details:

1. In the Cloudflare dashboard, go to **DNS**.
2. Select **Records**.
3. Add a **CNAME** record.
4. Enter the name as `*` or the name of your subdomain (this should match the hostname you have for your app on the tunnel).
5. For the **Target**, enter the tunnel ID followed by `.cfargotunnel.com`
6. Set the proxy status to **Proxied**.

Now, visit the domain of your application, and it should be accessible there.

---

---
url: /docs/services/activepieces.md
description: >-
  Deploy ActivePieces workflow automation platform on Coolify with
  TypeScript-based extensible automation, visual builder, and 100+ integrations.
---

## What is ActivePieces

Your friendliest open source all-in-one automation tool, designed to be extensible through a type-safe pieces framework written in Typescript.

## Visual Demos

---

---
url: /docs/services/actualbudget.md
description: >-
  Host Actual Budget on Coolify for privacy-focused envelope budgeting with
  multi-device sync, end-to-end encryption, and real-time financial tracking.
---

## What is Actual Budget?

Actual Budget is a super fast and privacy-focused app for managing your finances. At its heart is the well proven and much loved Envelope Budgeting methodology.

You own your data and can do whatever you want with it. Featuring multi-device sync, optional end-to-end encryption and so much more.

## Screenshots

## Links

* [The official website](https://actualbudget.org/?utm_source=coolify.io)
* [GitHub](https://github.com/actualbudget/actual?utm_source=coolify.io)

---

---
url: /docs/get-started/contribute/service.md
description: >-
  Add new service templates to Coolify using Docker Compose with magic
  environment variables, storage handling, and one-click deployment features.
---

# Adding a new service template to Coolify

Services in Coolify are templates made from normal [docker-compose](https://docs.docker.com/reference/compose-file/) files with some added Coolify magic.

::: info
See [Coolify's docker-compose specs](/knowledge-base/docker/compose#coolify-s-magic-environment-variables) to learn more about Coolify's magic and how to benefit from generated variables and storage handling. Please use this magic when submitting your PR to make the merging process smoother.
:::

1. Add metadata

   At the top of your `docker-compose` file, add the following metadata:

   ```yaml
   # documentation: https://docs.example.com/
   # slogan: A brief description of your service.
   # tags: tag1,tag2,tag3
   # logo: svgs/your-service.svg
   # port: 1234
   ```

   * `documentation`: Link to the service's official documentation
   * `slogan`: A short description of the service
   * `tags`: Comma-separated list for better searchability
   * `logo`: Path to the service's logo (see step 3)
   * `port`: The main entrypoint port of the service

::: warning Caution
Always specify a port, as Caddy Proxy cannot automatically determine the service's port.
:::

2. Create the docker-compose file

   Below the metadata, add your docker-compose configuration. Use Coolify's environment variable magic [here](/knowledge-base/docker/compose#coolifys-magic-environment-variables).

   Example:

   ```yaml
   services:
     app:
       image: your-service-image:tag
       environment:
         - DATABASE_URL=${COOLIFY_DATABASE_URL}
       volumes:
         - ${COOLIFY_VOLUME_APP}:/data
   ```

   **Using Required Environment Variables:**
   When creating service templates, mark critical configuration as required to improve user experience:

   ```yaml
   services:
     app:
       image: your-service:latest
       environment:
         # Required - critical configuration that must be set by the user
         - DATABASE_URL=${DATABASE_URL:?}
         - API_KEY=${API_KEY:?}

         # Required with sensible defaults - improves usability
         - PORT=${PORT:?8080}
         - LOG_LEVEL=${LOG_LEVEL:?info}

         # Optional - features that can be left empty
         - DEBUG=${DEBUG:-false}
         - CACHE_TTL=${CACHE_TTL:-3600}
   ```

   This helps users understand which configuration is essential and prevents deployment failures.

3. Add a logo

   * Create or obtain an SVG logo for your service (strongly preferred format)
   * If SVG is unavailable, use a high-quality.webp or JPG as a last resort
   * Add the logo file to the `svgs` folder in the Coolify repository
   * The logo filename should match the docker-compose service name exactly
     * For example, if your service name is `wordpress`, your logo should be `wordpress.svg` and the final path then is `svgs/wordpress.svg` use this path in the `logo` metadata.

4. Test your template

   Use the `Docker Compose Empty` deployment option in Coolify to test your template. This process mimics the one-click service deployment.

5. Submit a Pull Request

   Once your template works correctly:

   * Open a [PR](https://github.com/coollabsio/coolify/compare)
   * Add your new `<service>.yaml` compose file under `/templates/compose`
   * Include the logo file in the `svgs` folder

   ::: info
   Coolify uses a [parsed version](https://github.com/coollabsio/coolify/blob/main/templates/service-templates.json) of the templates for deployment.
   :::

## Adding a new service template to the Coolify Documentation

Once your service template is merged into Coolify, it will be important to also add documentation for it in the Coolify docs.
In the [Coolify Docs Contribute section](/get-started/contribute/documentation) we explain how to contribute and run the documentation on your own PC.
As soon as you have your local setup ready, follow these steps to add your new service:

1. Add service logo under `/docs/public/images/services/`

2. Create documentation file

   Create `/docs/services/<service-name>.md` with frontmatter:

   ```yaml
   ---
   title: "Service Name"
   description: "Here you can find the documentation for hosting Service Name with Coolify."
   ---
   ```

3. Write documentation

   Start writing your documentation under the frontmatter. Use the following template as a starting point:

   ```markdown
   # [Service Name]

   <ZoomableImage src="/docs/images/services/service.svg" alt="/ dashboard" />

   ## What is [Service Name]?

   Brief description and use cases.

   ## Links

   - [Official website](https://example.com?utm_source=coolify.io)
   - [GitHub](https://github.com/example/repo?utm_source=coolify.io)
   ```

4. Add Service to the Services Overview

   * Add the new service to the service list under `docs\.vitepress\theme\components\Services\List.vue` following the existing format:

   ```js
    {
        name: 'Service Name',
        slug: 'service-name', # Match the filename of your documentation file
        icon: '/docs/images/services/service.svg', # Path to your logo
        description: 'Brief description of the service.',
        category: 'Analytics' # Choose an appropriate category
    },
   ```

5. Submit Pull Request

   * Target the `next` branch
   * Test documentation renders correctly with `bun run dev`

# Request a new service

If there's a service template you'd like to see in Coolify:

1. Search [GitHub discussions](https://github.com/coollabsio/coolify/discussions/categories/service-template-requests) for existing requests.
2. If the service has been requested, upvote it. If not, create a new request.

---

---
url: /docs/services/affine.md
description: >-
  Deploy AFFiNE workspace on Coolify combining docs, whiteboards, and databases
  for seamless collaboration and creative project management.
---

## What is Affine?

AFFiNE is a workspace with fully merged docs, whiteboards and databases.

Get more things done, your creativity isnâ€™t monotone.

## Screenshots

## Links

* [The official website](https://affine.pro/?utm_source=coolify.io)
* [GitHub](https://github.com/toeverything/AFFiNE?utm_source=coolify.io)

---

---
url: /docs/services/all.md
description: >-
  Complete directory of one-click services in Coolify including AI, analytics,
  databases, CMS, monitoring, and more.
---

# All Services

Complete directory of all one-click services available in Coolify, organized by category.

## Administration

* [Cockpit](/services/cockpit) - Web-based server administration interface
* [Dashboard](/services/dashboard) - A simple dashboard for your server
* [Dashy](/services/dashy) - Customizable homepage dashboard for self-hosted services
* [Glance](/services/glance) - All-in-one Home Server Dashboard
* [Heimdall](/services/heimdall) - An elegant solution to organize all your web applications
* [Homarr](/services/homarr) - Customizable browser homepage and dashboard
* [Homepage](/services/homepage) - A modern homepage for your server
* [LiteQueen](/services/litequeen) - Lightweight service management platform
* [Organizr](/services/organizr) - Homepage organizer for your server services

## AI

* [AnythingLLM](/services/anythingllm) - An open-source LLM client that empowers developers to build and scale workflows quickly
* [Argilla](/services/argilla) - An open-source platform for building, training, and evaluating conversational AI models
* [Chroma](/services/chroma) - Open-source, AI-native vector database for building applications with embeddings
* [Flowise](/services/flowise) - Drag & drop UI to build your customized LLM flow
* [Label Studio](/services/labelstudio) - Open source data labeling platform
* [Langfuse](/services/langfuse) - Open source LLM engineering platform
* [LibreChat](/services/librechat) - Self-hosted, powerful, and privacy-focused chat UI for multiple AI models
* [LibreTranslate](/services/libretranslate) - Free and open-source machine translation API
* [LobeChat](/services/lobe-chat) - Open-source, modern AI chat framework with multi-provider support and knowledge base management
* [LiteLLM](/services/litellm) - Open source LLM Gateway to manage authentication, loadbalancing, and spend tracking across 100+ LLMs
* [MindsDB](/services/mindsdb) - Machine learning platform that brings AI to databases
* [NewAPI](/services/newapi) - The next-generation LLM gateway and AI asset management system supports multiple languages.
* [Ollama](/services/ollama) - A lightweight and efficient server for running large language models (LLMs) on your local machine or in the cloud
* [Open WebUI](/services/open-webui) - User-friendly WebUI for LLMs, formerly Ollama WebUI
* [Qdrant](/services/qdrant) - Open source, AI-native vector database
* [Unstructured](/services/unstructured) - Open-source platform and tools to ingest and process unstructured documents for Retrieval Augmented Generation (RAG) and model fine-tuning
* [Weaviate](/services/weaviate) - Open source, AI-native vector database

## Analytics

* [Apache Superset](/services/apache-superset) - Open-source data visualization and exploration platform
* [Metabase](/services/metabase) - The simplest, fastest way to share data and analytics inside your company
* [OpenPanel](/services/openpanel) - Open source alternative to Mixpanel and Plausible for product analytics
* [PostHog](/services/posthog) - Open source product analytics
* [Plausible](/services/plausible) - A lightweight, open-source web analytics tool that prioritizes user privacy by not using cookies
* [Rybbit](/services/rybbit) - Next-gen, open source, lightweight, cookieless web & product analytics for everyone
* [Sequin](/services/sequin) - The fastest Postgres change data capture
* [Superset](/services/superset) - Open-source data visualization and exploration platform
* [Swetrix](/services/swetrix) - Privacy-friendly and cookieless European web analytics alternative to Google Analytics
* [Umami](/services/umami) - A lightweight, open-source web analytics tool that prioritizes user privacy by not using cookies

## Automation

* [Activepieces](/services/activepieces) - Open source no-code business automation
* [Evolution API](/services/evolution-api) - WhatsApp API service for automation
* [N8N](/services/n8n) - Workflow automation tool
* [Trigger](/services/trigger) - Open-source workflow automation tool

## Backup

* [Duplicati](/services/duplicati) - A free backup client that securely stores encrypted, incremental, compressed backups on cloud storage services and remote file servers
* [Postgresus](/services/postgresus) - A free, open source and self-hosted tool to backup PostgreSQL. Make backups with different storages and notifications about progress.

## Bookmarks

* [Hoarder](/services/hoarder) - Self-hosted bookmark manager with AI-powered tagging

## Browser

* [Firefox](/services/firefox) - Firefox browser in a container

## Business

* [Chaskiq](/services/chaskiq) - Open source customer engagement platform
* [Chatwoot](/services/chatwoot) - Open-source customer engagement suite
* [Documenso](/services/documenso) - Open-source DocuSign alternative for document signing
* [Docuseal](/services/docuseal) - Open source DocuSign alternative
* [Dolibarr](/services/dolibarr) - Open-source ERP and CRM software
* [Easy Appointments](/services/easyappointments) - Open-source appointment scheduler
* [Fider](/services/fider) - An open platform to collect and organize customer feedback
* [FreeScout](/services/freescout) - Help desk and customer support application
* [Invoice Ninja](/services/invoice-ninja) - Invoice management system
* [Kimai](/services/kimai) - An open-source time-tracking solution for teams of all sizes
* [LimeSurvey](/services/limesurvey) - The most popular FOSS online survey tool on the web
* [Odoo](/services/odoo) - Open source ERP and CRM
* [OrangeHRM](/services/orangehrm) - Free HR management system for businesses
* [osTicket](/services/osticket) - Open-source help desk ticketing system
* [Paymenter](/services/paymenter) - Open-Source Billing, Built for Hosting Providers

## CMS

* [ClassicPress](/services/classicpress) - A business-focused CMS with a strong community
* [Directus](/services/directus) - An open-source headless CMS and API for custom databases
* [Drupal](/services/drupal) - Open-source content management system
* [Ghost](/services/ghost) - A professional publishing platform
* [Joomla](/services/joomla) - Open-source content management system
* [Strapi](/services/strapi) - Open-source headless CMS
* [WordPress](/services/wordpress) - Website and blogging platform

## Communication

* [GoWa](/services/gowa) - Golang WhatsApp - Built with Go for efficient memory use
* [Matrix](/services/matrix) - Chat securely with your family, friends, community
* [Mattermost](/services/mattermost) - Open-source messaging platform for teams
* [Once Campfire](/services/once-campfire) - Web-based chat application with rooms, direct messages, and file attachments
* [Rocket.Chat](/services/rocketchat) - Open source team chat software

## Crypto

* [Bitcoin Core](/services/bitcoin-core) - Bitcoin Core full node software

## Database

* [NocoDB](/services/nocodb) - Open Source Airtable Alternative
* [PGBackWeb](/services/pgbackweb) - Effortless PostgreSQL backups with a user-friendly web interface
* [Teable](/services/teable) - No-code database built on PostgreSQL

## Design

* [Penpot](/services/penpot) - Open Source design & prototyping platform

## Development

* [Apprise API](/services/apprise-api) - RESTful API for Apprise notification library
* [Appsmith](/services/appsmith) - A low-code application platform for building internal tools
* [Appwrite](/services/appwrite) - A backend-as-a-service platform that simplifies the web & mobile app development
* [Browserless](/services/browserless) - Headless Chrome as a service
* [Budibase](/services/budibase) - Low-code platform for building internal tools and business apps
* [Bugsink](/services/bugsink) - Self-hosted Error Tracking
* [CloudBeaver](/services/cloudbeaver) - Universal database tool with web interface
* [Cloudflared](/services/cloudflared) - Cloudflare Tunnel client
* [Code Server](/services/code-server) - Run VS Code on any machine anywhere and access it in the browser
* [Convex](/services/convex) - Backend platform for web developers
* [Deno KV](/services/denokv) - Deno's built-in key-value database service
* [Docker Registry](/services/docker-registry) - A Docker registry to store and manage your Docker images
* [Dozzle](/services/dozzle) - Realtime log viewer for docker containers
* [Drizzle Gateway](/services/drizzle-gateway) - Drizzle Studio for exploring SQL databases
* [Flipt](/services/flipt) - Open-source feature flag management platform
* [Forgejo](/services/forgejo) - A self-hosted Git service fork of Gitea
* [Formbricks](/services/formbricks) - A form builder for static sites
* [Gitea](/services/gitea) - A painless self-hosted Git service
* [GitHub Runner](/services/github-runner) - A GitHub Actions runner for Docker
* [GitLab](/services/gitlab) - DevOps lifecycle tool
* [GlitchTip](/services/glitchtip) - An open-source error tracking tool
* [Gotenberg](/services/gotenberg) - A Docker-powered stateless API for PDF files
* [HeyForm](/services/heyform) - Open-source form builder for conversational forms
* [Hoppscotch](/services/hoppscotch) - Open-source API development ecosystem
* [IT Tools](/services/it-tools) - Collection of handy online tools for developers
* [Jenkins](/services/jenkins) - Open-source automation server
* [Jupyter Notebook](/services/jupyter-notebook-python) - Interactive computing environment for Python
* [Kuzzle](/services/kuzzle) - A powerful backend that enables you to build modern apps faster
* [Lowcoder](/services/lowcoder) - Open-source low-code platform for building internal tools
* [Mailpit](/services/mailpit) - Self-hosted email and SMTP testing tool
* [Marimo](/services/marimo) - Open-source reactive notebook for Python
* [Martin](/services/martin) - PostGIS vector tile server
* [Neon WS Proxy](/services/neon-ws-proxy) - WebSocket proxy for Neon database
* [Nexus](/services/nexus) - A repository manager that allows you to store, manage, and distribute your software artifacts
* [Next Image Transformation](/services/next-image-transformation) - Image transformation service for Next.js
* [Nitropage](/services/nitropage) - Nitropage is an extensible, drag-and-drop website builder based on SolidStart, completely free and open source
* [OneDev](/services/onedev) - Self-hosted Git server with integrated CI/CD and kanban
* [Openblocks](/services/openblocks) - Open-source low code platform
* [pgAdmin](/services/pgadmin) - Web-based database management tool for PostgreSQL
* [phpMyAdmin](/services/phpmyadmin) - MySQL database management tool
* [Pocketbase](/services/pocketbase) - Open Source backend for your next SaaS and Mobile app
* [Portainer](/services/portainer) - Container management platform
* [Prefect](/services/prefect) - Open source workflow management platform
* [Proxyscotch](/services/proxyscotch) - Tiny open-source CORS proxy made by Hoppscotch
* [PrivateBin](/services/privatebin) - Minimalist, open-source online pastebin
* [RabbitMQ](/services/rabbitmq) - Open source message broker
* [Redis Insight](/services/redis-insight) - Official Redis GUI for database interaction
* [Rivet Engine](/services/rivet-engine) - Backend engine for building and scaling stateful workloads with long-lived processes and durable state
* [Shlink](/services/shlink) - The open source URL shortener
* [Soketi](/services/soketi) - Open-source WebSocket server
* [Supabase](/services/supabase) - Open source Firebase alternative
* [Tolgee](/services/tolgee) - Open source localization platform
* [Unleash](/services/unleash) - Open-source feature management platform
* [VvvebJs](/services/vvveb) - Powerful website builder with drag and drop functionality
* [Wakapi](/services/wakapi) - Open-source coding activity tracker
* [Web Check](/services/web-check) - All-in-one website analysis tool
* [Weblate](/services/weblate) - Web-based translation tool
* [Windmill](/services/windmill) - Open-source developer platform

## Documentation

* [BookStack](/services/bookstack) - Self-hosted wiki-style documentation platform
* [Docmost](/services/docmost) - Open-source document collaboration platform
* [DokuWiki](/services/dokuwiki) - A simple to use and highly versatile Open Source wiki software that doesn't require a database
* [MediaWiki](/services/mediawiki) - A free and open-source wiki software package
* [Paperless](/services/paperless) - Document management system that transforms physical documents into searchable online archives
* [Stirling PDF](/services/stirling-pdf) - Powerful PDF manipulation tool
* [Wiki.js](/services/wikijs) - Modern and powerful wiki software built on Node.js

## Education

* [Moodle](/services/moodle) - Open-source learning platform

## Email

* [Unsend](/services/unsend) - An open source bulk email manager

## Family

* [Gramps Web](/services/gramps-web) - The free, open-source genealogy system

## File Management

* [Filebrowser](/services/filebrowser) - A file manager for the web
* [FileFlows](/services/fileflows) - A automatic file processing service
* [Syncthing](/services/syncthing) - Open Source Continuous File Synchronization
* [Zipline](/services/zipline) - Next generation ShareX / File upload server

## File Sharing

* [Pairdrop](/services/pairdrop) - Local file sharing in your browser
* [PingvinShare](/services/pingvinshare) - Self-hosted file sharing platform that combines lightness and beauty
* [Snapdrop](/services/snapdrop) - Local file sharing in your browser

## Finance

* [Actual Budget](/services/actualbudget) - A local-first personal finance tool based on zero-based budgeting
* [BudgE](/services/budge) - A budgeting personal finance app
* [Firefly III](/services/firefly-iii) - A personal finances manager
* [Maybe](/services/maybe) - Personal finance and wealth management application

## Forum

* [NodeBB](/services/nodebb) - Node.js based forum software

## Gaming

* [FoundryVTT](/services/foundryvtt) - Virtual tabletop for tabletop role-playing games
* [Minecraft](/services/minecraft) - Minecraft game server
* [Pterodactyl](/services/pterodactyl) - Game server management panel with Wings daemon for hosting Minecraft, CS:GO, ARK and more

## Health

* [Baby Buddy](/services/babybuddy) - It helps parents track their baby's daily activities, growth, and health with ease
* [SparkyFitness](/services/sparkyfitness) - A comprehensive fitness tracking and management application designed to help users monitor their nutrition, exercise, and body measurements

## Home

* [Grocy](/services/grocy) - A self-hosted groceries & household management solution for your home
* [Home Assistant](/services/home-assistant) - Openâ€‘source home automation platform focused on local control and privacy
* [Homebox](/services/homebox) - Inventory and organization system built for the Home User
* [Mealie](/services/mealie) - Self-hosted recipe manager and meal planner

## IoT

* [Mosquitto](/services/mosquitto) - Open-source MQTT broker
* [Traccar](/services/traccar) - Open-source GPS tracking platform

## Marketing

* [Listmonk](/services/listmonk) - Self-hosted newsletter and mailing list manager
* [Mautic](/services/mautic) - Open-source marketing automation platform
* [Plunk](/services/plunk) - Self-hosted email marketing platform

## Media

* [Audiobookshelf](/services/audiobookshelf) - Self-hosted audiobook and podcast server
* [Calibre-web](/services/calibre-web) - Web app for browsing, reading and downloading eBooks from a Calibre database
* [Cap](/services/cap) - Open source alternative to Loom for screen recording and sharing
* [Castopod](/services/castopod) - Open-source podcast hosting platform
* [Emby](/services/emby) - A media server to organize, play, and stream audio and video to a variety of devices
* [Emby Stat](/services/emby-stat) - A simple and easy-to-use Emby statistics dashboard
* [Immich](/services/immich) - Self-hosted photo and video backup solution
* [Jellyfin](/services/jellyfin) - The Free Software Media System
* [Metube](/services/metube) - A self-hosted video sharing platform
* [Navidrome](/services/navidrome) - Modern music server and streamer compatible with Subsonic/Airsonic
* [Overseerr](/services/overseerr) - A request management and media discovery tool built to work with your existing Plex ecosystem
* [Plex](/services/plex) - Media server software
* [Prowlarr](/services/prowlarr) - A free and open source BitTorrent client
* [qBittorrent](/services/qbittorrent) - Free and open-source BitTorrent client
* [Radarr](/services/radarr) - A Media server software
* [Sonarr](/services/sonarr) - A internet PVR for Usenet and Torrents
* [Transmission](/services/transmission) - Fast, easy, and free BitTorrent client
* [Yamtrack](/services/yamtrack) - Self-hosted music scrobble database

## Monitoring

* [Beszel](/services/beszel) - Lightweight server monitoring hub with historical data, docker stats, and alerts
* [Changedetection](/services/changedetection) - Website change detection monitor and notifications
* [Checkmate](/services/checkmate) - Website monitoring and uptime service
* [Diun](/services/diun) - Docker Image Update Notifier
* [Glances](/services/glances) - Cross-platform system monitoring tool
* [Grafana](/services/grafana) - The open platform for beautiful analytics and monitoring
* [Observium](/services/observium) - Low-maintenance auto-discovering network monitoring platform
* [Statusnook](/services/statusnook) - A status page system for your website
* [Uptime Kuma](/services/uptime-kuma) - A fancy self-hosted monitoring tool

## Networking

* [Cloudflared](/services/cloudflared) - Cloudflare Tunnel client
* [NetBird Client](/services/netbird-client) - Connect your devices into a secure WireGuard-based mesh network

## Notifications

* [Ntfy](/services/ntfy) - Simple HTTP-based pub-sub notification service
* [Gotify](/services/gotify) - Open-source push notifications for web and mobile apps

## Productivity

* [Affine](/services/affine) - Open-source knowledge base and workspace combining docs, whiteboards, and databases
* [Cal.com](/services/calcom) - Open-source Calendly alternative for scheduling meetings
* [CodiMD](/services/codimd) - Realtime collaborative markdown notes on all platforms
* [Excalidraw](/services/excalidraw) - Virtual whiteboard for sketching hand-drawn like diagrams
* [Grist](/services/grist) - Modern relational spreadsheet combining flexibility and database robustness
* [Joplin](/services/joplin) - Open-source note taking and to-do application
* [KaraKeep](/services/karakeep) - Self-hostable bookmark-everything app with AI-based automatic tagging
* [LibreOffice](/services/libreoffice) - Free and open-source office suite
* [Memos](/services/memos) - Open-source, self-hosted memo hub with knowledge management
* [Outline](/services/outline) - Open-source collaboration tool
* [Rallly](/services/rallly) - Open-source meeting scheduling tool
* [Reactive Resume](/services/reactive-resume) - A free and open source resume builder
* [Readeck](/services/readeck) - Web article reader and bookmark manager
* [Ryot](/services/ryot) - Self-hosted platform for tracking various facets of your life
* [Siyuan](/services/siyuan) - A privacy-first, self-hosted, fully open source personal knowledge management software.
* [Slash](/services/slash) - Open-source, self-hosted links and notes manager
* [TriliumNext](/services/triliumnext) - Build your personal knowledge base with TriliumNext Notes
* [Vikunja](/services/vikunja) - The open-source to-do app

## Project Management

* [Leantime](/services/leantime) - Lean project management system for innovators
* [Plane](/services/plane) - Open source project planning tool

## RSS

* [FreshRSS](/services/freshrss) - Free, self-hostable RSS feed aggregator
* [Miniflux](/services/miniflux) - Minimalist and opinionated feed reader

## Search

* [Elasticsearch](/services/elasticsearch) - Free and Open Source, Distributed, RESTful Search Engine
* [Meilisearch](/services/meilisearch) - A powerful, fast, open-source, easy to use, and deploy search engine
* [SearXNG](/services/searxng) - Open source search engine
* [Typesense](/services/typesense) - Open source alternative to Algolia and easier-to-use alternative to ElasticSearch
* [Whoogle](/services/whoogle) - Self-hosted, ad-free, privacy-respecting metasearch engine

## Security

* [Authentik](/services/authentik) - An open-source Identity Provider, focused on flexibility and versatility
* [Cryptgeon](/services/cryptgeon) - Secure note sharing service with self-destructing messages
* [CyberChef](/services/cyberchef) - Data analysis and manipulation tool for cybersecurity
* [Faraday](/services/faraday) - Collaborative penetration testing and vulnerability management platform
* [Infisical](/services/infisical) - Open source secret management platform
* [Keycloak](/services/keycloak) - Open-source identity and access management solution
* [Logto](/services/logto) - Logto is an Auth0 alternative designed for modern apps and SaaS products
* [Passbolt](/services/passbolt) - Open source password manager for teams
* [Pi-hole](/services/pi-hole) - Network-wide ad blocker that acts as a DNS sinkhole
* [Pocket ID](/services/pocket-id) - A simple OIDC provider for passwordless authentication with passkeys
* [SuperTokens](/services/supertokens) - Open-source authentication solution
* [Vaultwarden](/services/vaultwarden) - Unofficial Bitwarden compatible server
* [WireGuard Easy](/services/wireguard-easy) - Easy-to-use WireGuard VPN server

## Social Media

* [Bluesky PDS](/services/bluesky-pds) - Bluesky PDS (Personal Data Server) for decentralized social networking
* [Mixpost](/services/mixpost) - Self-hosted social media management software (Buffer alternative)
* [Postiz](/services/postiz) - Social media scheduling and analytics tool
* [Redlib](/services/redlib) - Private front-end for Reddit

## Storage

* [MinIO](/services/minio) - A high-performance, distributed object storage system
* [Nextcloud](/services/nextcloud) - A safe home for all your data
* [ownCloud](/services/owncloud) - File synchronization and sharing platform
* [Seafile](/services/seafile) - High-performance file syncing and sharing with knowledge management features

## Utilities

* [ConvertX](/services/convertx) - File conversion service supporting multiple formats
* [Vert](/services/vert) - Self-hosted file converter

***

Looking for a searchable interface? Visit our [interactive services search](/services/overview) page.

To request a new service, please check our [contribution guide](https://github.com/coollabsio/coolify/blob/v4.x/CONTRIBUTING.md).

---

---
url: /docs/services/anythingllm.md
description: >-
  Run AnythingLLM on Coolify for all-in-one AI application with RAG, AI agents,
  document chat, and multi-model support without infrastructure hassle.
---

# AnythingLLM

![AnythingLLM](/images/services/anythingllm.webp)

## What is AnythingLLM?

AnythingLLM is the easiest to use, all-in-one AI application that can do RAG, AI Agents, and much more with no code or infrastructure headaches.

## Screenshots

![AnythingLLM](/images/services/anythingllm.gif)

## Links

* [The official website](https://www.anythingllm.com?utm_source=coolify.io)
* [GitHub](https://github.com/Mintplex-Labs/anything-llm?utm_source=coolify.io)

---

---
url: /docs/services/superset.md
description: >-
  Deploy Apache Superset on Coolify for modern data exploration, interactive
  dashboards, SQL editor, and business intelligence visualization.
---

[![Superset](https://camo.githubusercontent.com/f6f25227203811335bbfc181e6dded66b57cbdbeafe346c0f4e5773bae157aeb/68747470733a2f2f73757065727365742e6170616368652e6f72672f696d672f73757065727365742d6c6f676f2d686f72697a2d6170616368652e737667)](https://superset.apache.org)

## What is Apache Superset?

Apache Superset is a modern data exploration and data visualization platform. Superset can replace or augment proprietary business intelligence tools for many teams. Superset integrates well with a variety of data sources.

## Unofficial Docker Image

By default, superset [does not support the use of docker-compose in production](https://github.com/amancevice/docker-superset). Coolify's superset template uses a [third-party, unofficial docker image created by amancevice](https://github.com/amancevice/docker-superset).

## Usage

### Initial Setup

After deploying the template, you will need to initialise the database and create your admin user. This can be done as follows:

1. Open a termianal session to the superset docker container

2. Run one of the commands below, noting the `-` symbol:

   ```bash
   # Basic initialisation
   superset-init

   # Alternatively, to also load demo data, use
   superset-demo
   ```

   the source code for these scripts are available [here](https://github.com/amancevice/docker-superset/tree/main/bin).

3. Answer all questions in the prompts

You can find the video instructions for this process in [Coolify's GitHub repository's pull request #4891](https://github.com/coollabsio/coolify/pull/4891).

### Connecting to other Databases on Coolify Network

If you wish to connect to databases hosted on Coolify, but external to the Superset service template, you will need to turn on the option: [Connect to Predefined Networks](https://coolify.io/docs/knowledge-base/docker/compose#connect-to-predefined-networks).

### Configuring Superset

Please refer to the [official documentation](https://superset.apache.org/docs/configuration/configuring-superset) for how you can tweak your `superset_config.py`.

This python config file can be edited using Coolify's UI by navigating to your service's [Persistent Storage](https://coolify.io/docs/knowledge-base/persistent-storage) under the Configuration tab.

## Links

* [Official Website](https://superset.apache.org)
* [GitHub](https://github.com/apache/superset)
* [Github Unofficial Docker Image](https://github.com/amancevice/docker-superset)

---

---
url: /docs/applications.md
description: >-
  Deploy web applications on Coolify with Nixpacks, Docker, static sites, build
  packs, environment variables, and automated deployments.
---

# Applications

Application could be any type of web application. It could be a static site, a NodeJS application, a PHP application, etc.

For complex applications, you can use Docker Compose based deployments or the one-click services.

## How Deployments Work

Coolify deploys all applications as Docker containers. This means your app runs inside an isolated container on your server.

**Key Concepts:**

* **Docker Image:** A packaged version of your application with all dependencies included
* **Container:** A running instance of your Docker image
* **Build Process:** Transforms your source code into a Docker image ready for deployment

You have two options for deploying applications:

1. **Build on Coolify:** Use [build packs](/applications/build-packs/overview) to automatically create Docker images from your source code
2. **Use Pre-built Images:** Deploy existing images from registries like [Docker Hub](https://hub.docker.com/?utm_source=coolify.io) or [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry?utm_source=coolify.io)

::: tip Resource Management
Building Docker images can be resource-intensive. You can use a dedicated [build server](/knowledge-base/server/build-server) to handle builds separately from your production server.
:::

## Examples

::: info
The list is not complete.

You can host almost any application that you want, not just the ones listed here.
:::

* [Vite](/applications/vite)
* [Django](/applications/django)
* [Jekyll](/applications/jekyll)
* [Vue.js](/applications/vuejs)
* [Next.js](/applications/nextjs)
* [Nuxt](/applications/nuxt)
* [Laravel](/applications/laravel)
* [Symfony](/applications/symfony)
* [Ruby on Rails](/applications/rails)
* [SvelteKit](/applications/svelte-kit)

## General Configuration

### Commands

You can overwrite the default commands by setting a custom value on the UI.

* Build
* Install
* Start

::: info
If you leave it empty, Nixpacks will detect which commands to run. For
example, in Nodejs, it will check the lock files and run `npm ci` or `yarn
  install` or `pnpm install` accordingly.
:::

### Base Directory

It is useful for monorepos. You can set the base directory for all the commands that will be executed by Coolify.

### Public Directory

If you are building a static site, it is important to set the public directory, so the builder will know which directory to serve.

### Port Exposes

Port exposes are required for Docker Engine to know which ports to expose. The first port will be the default port for health checks.

Examples:

If you have a NodeJS application that listens on port 3000, you can set it like this: `3000`.
If you have a PHP-FPM application that listens on port 9000, you can set it like this: `9000`.
If you have a Nginx server that listens on port 80, you can set it like this: `80`.

### Port Mappings

::: warning
You will lose some functionality if you map a port to the host system, like
`Rolling Updates`.
:::

If you would like to map a port to the host system (server), you can do it here like this: `8080:80`.

This will map the port 8080 on the host system to the port 80 inside the container.

::: info
If you would like to get performance boost and you do not need any domain
(websocket server with VERY high traffic), you can map its port to the host,
so the request will not go through the proxy.
:::

## Advanced

### Static Site (Is it a static site?)

> This feature is only available for Nixpacks buildpacks.

If you need to serve a static site (SPA, HTML, etc), you can set this to `true`. It will be served by Nginx. `Disabled by default`.

### Force HTTPS

If you would like to force HTTPS, so no HTTP connections allowed, you can set this to `true`. `Enabled by default`.

### Auto Deploy

> This feature is only available for GitHub App based repositories.

If you would like to deploy automatically when a new commit is pushed to the repository, you can set this to `true`. `Enabled by default`.

### Preview Deployments

Preview deployments are a great way to test your application before merging it into the main branch. Imagine it like a staging environment.

#### URL Template

You can setup your preview URL with a custom template. Default is `{{pr_id}}.{{domain}}`.

This means that if you open a Pull Request with the ID `123`, and you resource domain is `example.com` the preview URL will be `123.example.com`.

:::success TIP
If you have several domains for your resource, the first will be used as the{" "}
`{{ domain }}` part.
:::

#### Automated Preview Deployments

> This feature is only available for GitHub App based repositories.

If you would like to deploy a preview version of your application (based on a Pull Requests), you can set this to `true`. `Disabled by default`.

If set to `true`, all PR's that are opened against the resource's configured branch, will be deployed to a unique URL.

#### Manually Triggered Preview Deployments

You can manually deploy a Pull Request to a unique URL by clicking on the `Deploy` button on the Pull Request page.

### Git Submodules

If you are using git submodules, you can set this to `true`. `Enabled by default`.

### Git LFS

If you are using git lfs, you can set this to `true`. `Enabled by default`.

### Environment Variables

[Read here](/knowledge-base/environment-variables)

### Persistent Storage

[Read here](/knowledge-base/persistent-storage)

### Health Checks

By default, all containers are checked for liveness.

:::warning
Traefik Proxy won't work if the container has health check defined, but it is
`unhealthy`. If you do not know how to set up health checks, turn it off.
:::

### Rollbacks

You can rollback to a previous version of your resource. At the moment, only local images are supported, so you can only rollback to a locally available docker image.

### Resource Limits

By default, the container won't have any resource limits. You can set the limits here. For more details, read the [Docker documentation](https://docs.docker.com/reference/compose-file/services).

## Deployment Types

There are several types of application deployments available.

* Public Git Repository
* Private Git Repository ([GitHub App](https://docs.github.com/en/apps/using-github-apps/about-using-github-apps))
* Private Git Repository ([Deploy Key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys))
* Based on a Dockerfile
* Based on a Docker Compose
* Based on a Docker Image

## Build Packs

Build packs help transform your source code into Docker images. Coolify supports several build pack options to match different deployment needs:

* **[Nixpacks](/applications/build-packs/nixpacks)** - Automatic detection and building (recommended for most applications)
* **[Static](/applications/build-packs/static)** - For static sites and SPAs
* **[Dockerfile](/applications/build-packs/dockerfile)** - Use your own custom Dockerfile
* **[Docker Compose](/applications/build-packs/docker-compose)** - For multi-service applications
* **Docker Image** - Deploy pre-built images from registries

For detailed guides on each build pack, see the [Build Packs section](/applications/build-packs/overview).

:::tip Quick Start
Coolify uses [Nixpacks](https://nixpacks.com) by default, which automatically detects your application type and builds it accordingly. For most applications, you won't need to configure anything.
:::

---

---
url: /docs/services/apprise-api.md
description: >-
  Host Apprise API on Coolify to send push notifications to 100+ services via
  unified REST API for alerts, monitoring, and messaging workflows.
---

# What is Apprise API?

[Apprise-api](https://github.com/caronc/apprise-api) Takes advantage of [Apprise](https://github.com/caronc/apprise) through your network with a user-friendly API.

* Send notifications to more than 100 services.
* An incredibly lightweight gateway to Apprise.
* A production ready micro-service at your disposal.
* A Simple Website to verify and test your configuration with.

Apprise API was designed to easily fit into existing (and new) eco-systems that are looking for a simple notification solution.

## Screenshots

![](https://raw.githubusercontent.com/caronc/apprise-api/master/Screenshot-2.png)

![](https://raw.githubusercontent.com/caronc/apprise-api/master/Screenshot-3.png)

## Links

* [The official website](https://hub.docker.com/r/caronc/apprise/?utm_source=coolify.io)
* [GitHub](https://github.com/caronc/apprise-api?utm_source=coolify.io)

---

---
url: /docs/services/appsmith.md
description: >-
  Build internal tools on Coolify with Appsmith's low-code platform featuring
  drag-and-drop UI, database connectors, and custom business logic.
---

# Appsmith

![Appsmith](https://raw.githubusercontent.com/appsmithorg/appsmith/release/static/images/appsmith-in-100-seconds.png)

## What is Appsmith

Organizations build internal applications such as dashboards, database GUIs, admin panels, approval apps, customer support tools, etc. to help improve their business operations.

Appsmith is an open-source developer tool that enables the rapid development of these applications. You can drag and drop pre-built widgets to build UI.

Connect securely to your databases & APIs using its datasources. Write business logic to read & write data using queries & JavaScript.

## Why Appsmith

Appsmith makes it easy to build a UI that talks to any datasource. You can create anything from simple CRUD apps to complicated multi-step workflows with a few simple steps:

* Connect Datasource: Integrate with a database or API. Appsmith supports the most popular databases and REST APIs.
* Build UI: Use built-in widgets to build your app layout.
* Write Logic: Express your business logic using queries and JavaScript anywhere in the editor.
* Collaborate, Deploy, Share: Appsmith supports version control using Git to build apps in collaboration using branches to track and roll back changes. Deploy the app and share it with other users.

## Learning Resources

* [Documentation](https://docs.appsmith.com?utm_source=coolify.io)
* [Tutorials](https://docs.appsmith.com/getting-started/tutorials?utm_source=coolify.io)
* [Videos](https://www.youtube.com/appsmith?utm_source=coolify.io)
* [Templates](https://www.appsmith.com/templates?utm_source=coolify.io)

## Need Help?

* [Discord](https://discord.gg/rBTTVJp?utm_source=coolify.io)
* [Community Portal](https://community.appsmith.com/?utm_source=coolify.io)
* <support@appsmith.com>

## Links

* [The official website](https://www.appsmith.com?utm_source=coolify.io)
* [GitHub](https://github.com/appsmithorg/appsmith?utm_source=coolify.io)

---

---
url: /docs/services/appwrite.md
description: >-
  Deploy Appwrite BaaS on Coolify for authentication, databases, storage,
  serverless functions, and real-time APIs for web and mobile apps.
---

# Appwrite

![Appwrite](https://raw.githubusercontent.com/appwrite/appwrite/main/public/images/banner.png)

## What is Appwrite?

Appwrite is an end-to-end backend server for Web, Mobile, Native, or Backend apps packaged as a set of Docker microservices. Appwrite abstracts the complexity and repetitiveness required to build a modern backend API from scratch and allows you to build secure apps faster.

Using Appwrite, you can easily integrate your app with user authentication and multiple sign-in methods, a database for storing and querying users and team data, storage and
file management, image manipulation, Cloud Functions, and [more services](https://appwrite.io/docs?utm_source=coolify.io).

## Links

* [The official website](https://appwrite.io?utm_source=coolify.io)
* [GitHub](https://github.com/appwrite/appwrite?utm_source=coolify.io)

---

---
url: /docs/services/argilla.md
description: >-
  Host Argilla on Coolify for collaborative AI dataset creation, annotation,
  labeling, and feedback collection for machine learning projects.
---

## What is Argilla?

Argilla is a collaboration tool for AI engineers and domain experts to build high-quality datasets.

## Screenshots

## Links

* [The official website](https://argilla.io/?utm_source=coolify.io)
* [GitHub](https://github.com/argilla-io/argilla?utm_source=coolify.io)

---

---
url: /docs/services/audiobookshelf.md
description: >-
  Deploy Audiobookshelf on Coolify for self-hosted audiobook and podcast server
  with mobile apps, progress tracking, and streaming support.
---

# Audiobookshelf

## What is Audiobookshelf

Self-hosted audiobook, ebook, and podcast server

## Links

* [Official Documentation](https://www.audiobookshelf.org/?utm_source=coolify.io)

---

---
url: /docs/services/authentik.md
description: >-
  Run Authentik identity provider on Coolify with SSO, LDAP, OAuth2, SAML
  support for unified authentication and user management across apps.
---

![Authentik](https://goauthentik.io/img/icon_top_brand_colour.svg)

## What is authentik?

Authentik is an open-source Identity Provider that emphasizes flexibility and versatility. It can be seamlessly integrated into existing environments to support new protocols.

Authentik is also a great solution for implementing sign-up, recovery, and other similar features in your application, saving you the hassle of dealing with them.

## Screenshots

| Light                                                       | Dark                                                       |
| ----------------------------------------------------------- | ---------------------------------------------------------- |
| ![](https://docs.goauthentik.io/img/screen_apps_light.jpg)  | ![](https://docs.goauthentik.io/img/screen_apps_dark.jpg)  |
| ![](https://docs.goauthentik.io/img/screen_admin_light.jpg) | ![](https://docs.goauthentik.io/img/screen_admin_dark.jpg) |

## Links

* [The official website](https://goauthentik.io?utm_source=coolify.io)
* [GitHub](https://github.com/goauthentik/authentik?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/proxy/traefik/protect-services-with-authentik.md
description: >-
  Secure Coolify services with Authentik SSO forward authentication using
  Traefik middleware for proxy provider single sign-on protection.
---

# Authentik Forward Authentication Middleware

Traefik enables you to secure your applications with authentication by using a [Proxy Provider](https://docs.goauthentik.io/docs/add-secure-apps/providers/proxy/).
This allows you to protect your services with Single Sign-On (SSO).

## Configure an Authentik Application and Proxy Provider

The first step is to deploy the [Authentik service](/services/authentik) and then configure the required components:

* Create a Proxy Provider with forward authentication.
* Create an application and assign the Proxy Provider you created.
* In the "Cookie Domain" field, add the domain of the services.

## Create the Traefik Configuration

The next step is to add the Traefik middleware configuration to your instance's dynamic configuration.

Replace `AUTHENTIK_SERVER_HOST` with your instance name, e.g., `authentik-server-ncoc0ooog0ckwc0gwgoocgs8`.

```yaml
http:
  middlewares:
    authentik-auth:
      forwardAuth:
        address: 'http://AUTHENTIK_SERVER_HOST:9000/outpost.goauthentik.io/auth/traefik'
        trustForwardHeader: true
        authResponseHeaders:
          - X-authentik-username
          - X-authentik-groups
          - X-authentik-entitlements
          - X-authentik-email
          - X-authentik-name
          - X-authentik-uid
          - X-authentik-jwt
          - X-authentik-meta-jwks
          - X-authentik-meta-outpost
          - X-authentik-meta-provider
          - X-authentik-meta-app
          - X-authentik-meta-version
```

## Protecting Services

To protect a service, the Traefik middleware label must be added to the container's Docker Compose configuration:

```yaml
services:
  privatebin:
    image: privatebin/nginx-fpm-alpine
    environment:
      - SERVICE_FQDN_PRIVATEBIN_8080
    volumes:
      - 'privatebin_data:/srv/data'
    healthcheck:
      test:
        - CMD-SHELL
        - 'wget -qO- http://127.0.0.1:8080/'
      interval: 5s
      timeout: 20s
      retries: 10
    labels:
      - traefik.http.middlewares.authentik-auth@file
```

---

---
url: /docs/api-reference/authorization.md
description: >-
  Learn how to authorize API requests in Coolify with Bearer tokens, scoped
  permissions, and secure access control.
---

# Authorization

API request requires a `Bearer` token in `Authorization` header, which could be generated from the UI.

## Access

The API can be accesed through `http://<ip>:8000/api`.

With the exception of `/health` and `/feedback`, all routes are additionally prefixed with `/v1` resulting in the base rouce `http://<ip>:8000/api/v1`.

## Generate

1. Go to `Keys & Tokens` / `API tokens`.
2. Define a name for your token and click `Create New Token`.

::: success Tip
You will see the token once, so make sure to copy it and store it in a safe place.
:::

## Scope

The token will only be able to access resources that are owned by the team that the token is scoped to.

```php
# Sample token
3|WaobqX9tJQshKPuQFHsyApxuOOggg4wOfvGc9xa233c376d7
```

## Permissions

::: warning HEADS UP!
Some API data won't get returned if the API token doesn't have correct permissions
:::

Currently there are three types of permissions:

* read-only `(default)`
* read:sensitive
* view:sensitive
* `*` (all permissions)

### `read-only`

With this permission, you can only read data from the API, but you can't create, update, or delete any resources. Also you can't see sensitive data.

### `read:sensitive`

With this permission, you can only read data from the API and see sensitive information that is normally redacted. You cannot create, update, or delete any resources.

### `view:sensitive`

Without this permission, passwords, api keys, and other sensitive data will be redacted from the API response.

### `*`

Full access to all resources and sensitive data.

---

---
url: /docs/knowledge-base/server/automated-cleanup.md
description: >-
  Prevent disk space issues with Coolify's automated Docker cleanup removing
  stopped containers, unused images, build cache, and volumes on schedule or
  threshold.
---

# Automated Docker Cleanup

Coolify includes an automated Docker cleanup feature to prevent servers from running out of disk space. This guide explains how to configure it and what it does.

## Configuration

You can configure the automated cleanup under:
`Servers` > `YOUR_SERVER` > `Configuration` > `Advanced`

### Available Settings

1. **Docker Cleanup Threshold**
   * Sets the disk percentage threshold that triggers the cleanup.
   * Example: If set to 80%, cleanup will be triggered when disk usage exceeds 80%.

2. **Docker Cleanup Frequency**
   * Schedule cleanups using [cron expressions](/knowledge-base/cron-syntax) when `Force Docker Cleanup` is enabled.

::: success Tip

* We recommend enabling `Force Docker Cleanup` and scheduling cleanups using cron syntax.
* This provides more reliable cleanup behavior compared to relying on a disk threshold.
  :::

3. **Optional Cleanups**
   * Enable unused volumes cleanup (note: this can lead to data loss).
   * Enable unused networks cleanup.

## How It Works

### Safety Measures

* If there is an ongoing deployment, the cleanup will not be triggered to prevent any issues, like deleting the image that is currently being used.
* Only Coolify-managed resources are affected.

### Cleanup Process

When triggered (either by schedule or disk threshold), the system performs the following actions:

* Removes stopped containers managed by Coolify (no data loss as containers are non-persistent).
* Deletes unused Docker images.
* Clears Docker build cache.
* Removes old versions of Coolify helper images.
* Removes unused Docker volumes (if enabled).
* Removes unused Docker networks (if enabled).

---

---
url: /docs/knowledge-base/s3/aws.md
description: >-
  Set up automated Coolify backups with AWS S3 including IAM policy creation,
  bucket configuration, access key setup, and cost-effective lifecycle rules.
---

Coolify offers automated backups of your instance to an AWS S3 bucket, giving you a handsâ€‘off, reliable way to safeguard your configuration and data.

### Why use AWS S3 with Coolify?

1. **Enterpriseâ€‘grade durability & availability:** S3 is designed for 99.999999999% durability and automatic replication across multiple facilities, so your backups are always safe and accessible.

2. **Costâ€‘effective, pay as you go pricing:** Only pay for the storage and requests you actually use, with builtâ€‘in lifecycle rules (e.g., transition to Glacier) to optimize longâ€‘term costs.

3. **Seamless integration** â€“ Coolifyâ€™s backup scheduler hooks directly into S3â€™s API, eliminating the need for custom scripts or thirdâ€‘party tools and ensuring backups run on a schedule.

### When to avoid using AWS S3 with Coolify?

1. **Strict data residency or onâ€‘prem requirements:** If your regulations mandate keeping backups entirely within a private data center, S3â€™s public cloud model may not comply.

2. **No external network access:** In environments where outbound internet is blocked, Coolify cannot push snapshots to an S3 endpoint.

***

::: warning Example Data
The following data is used as an example in this guide. Please replace it with your actual data when following the steps:

* **S3 Bucket Name:** envix-coolify-backups-s3
* **IAM Policy Name:** EnvixCoolifyBackupS3Access
* **IAM Username:** EnvixCoolifyBackupS3User
* **Endpoint:** https://s3.ap-northeast-2.amazonaws.com
  :::

***

::: details TLDR (click to view)

1. Create a bucket in AWS Console
2. Create a custom policy in AWS Console with the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:GetObjectAcl",
        "s3:PutObjectAcl",
        "s3:PutObject"
      ],
      "Resource": [
        // rewrite your-bucket-name with your bucket name
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

3. Create an IAM user in AWS Console & attach the policy from the previous step.
4. Go to User settings & create an `Access Key` in AWS Console.
5. Add the `Access Key` and `Secret Key` in Coolify when you create a new S3 source.
   ::: success Tip
   You need to use the S3 HTTP endpoint without the bucket name, for example,`https://s3.eu-central-1.amazonaws.com`.
   :::

## 1. Create a S3 Bucket

To create your S3 Bucket, follow these steps:

Visit https://console.aws.amazon.com/s3 and Click on **Create Bucket** button

Youâ€™ll be asked to choose a name, object ownership, and so on.

::: info Note
Leave everything else to default values, only change things if you know what you are doing.
:::

Click on **Create Bucket** button

Once the bucket is created you will be redirected to this page:


## 2. Create IAM Policy

To create your IAM Policy, follow these steps:

Visit https://console.aws.amazon.com/iam/home#/policies and Click on **Create Policy** button




* Click on **JSON** option and copy paste the following code on the policy editor

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:GetObjectAcl",
        "s3:PutObjectAcl",
        "s3:PutObject"
      ],
      "Resource": [
        // replace envix-coolify-backups-s3 with your bucket name on below two lines
        "arn:aws:s3:::envix-coolify-backups-s3",
        "arn:aws:s3:::envix-coolify-backups-s3/*"
      ]
    }
  ]
}
```

Scroll down till the bottom of the page and click on the **Continue** button.

Then youâ€™ll be asked to choose a name for the policy:


Once you have entered the name, scroll down till the bottom of the page and click on the **Continue** button.

Once the Policy is created you will be redirected to this page:

::: success Tip
You won't see the policy you just created, you have to search for it's name on the search box.
:::

## 3. Create a IAM User

To create your IAM User, follow these steps:

Visit https://console.aws.amazon.com/iam/home#/users and Click on **Create user** button


Youâ€™ll be asked to choose a name for the user:


* Click on **Next** button after you have entered a name for the user.

Once the Policy is created you will be redirected to this page:


* Click on the username to create an access key.

## 4. Create an Access Key

After you have clicked on the username on previous step, you will be redirect to this page:


* Click on **Create access key** option to setup a new access key.

## 5. Setup S3 in Coolify

To create your setup S3 in Coolify, follow these steps:

In your Coolify dashboard:


1. Go to the **Storage** section in the sidebar.
2. Click **Add** button

1) Give a name for the S3 storage (this can be any name)
2) Give a short description for the storage (optional)
3) Enter the endpoint without your bucket name: `https://s3.YOUR_REGION_NAME.amazonaws.com`
4) Enter the name of the S3 bucket you created.
5) Enter your S3 bucket's region
6) Enter your Access Key
7) Enter your Secret Access Key
8) Click on **Validate Connection & Continue** button

Once the Bucket is validated you will be redirected to this page:


Then go to **settings** page and click on **Backup**




1. Enable S3
2. Select your S3 storage
3. Select the frequency of the backup (you can use this [website](https://www.convertloom.com/tools/cron-job-generator) if you are new to cron)
4. Setup Backup Retentions
5. Click on **Backup Now** button (just to check if everything works)

You can see the backups stored on your S3 from the execution logs:


Now youâ€™re done! Your Coolify instance is set up to automatically backup and store them on your Aws S3 bucket safely.

---

---
url: /docs/services/babybuddy.md
description: >-
  Track baby care on Coolify with Baby Buddy featuring feeding, diaper changes,
  sleep schedules, growth charts, and caregiver coordination.
---

![BabyBuddy](https://raw.githubusercontent.com/babybuddy/babybuddy/master/babybuddy/static_src/logo/icon.png)

## What is BabyBuddy?

A buddy for babies! Helps caregivers track sleep, feedings, diaper changes, tummy time and more to learn about and predict baby's needs without (*as much*) guess work.

## Screenshots

![Baby Buddy desktop view](https://raw.githubusercontent.com/babybuddy/babybuddy/master/screenshot.png)
![Baby Buddy mobile views](https://raw.githubusercontent.com/babybuddy/babybuddy/master/screenshot_mobile.png)

## Demo

A [demo of Baby Buddy](https://demo.baby-buddy.net?utm_source=coolify.io) is available. The demo instance
resets every hour. Login credentials are:

* Username: `admin`
* Password: `admin`

## Links

* [The official website](https://docs.baby-buddy.net?utm_source=coolify.io)
* [GitHub](https://github.com/babybuddy/babybuddy?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/how-to/backup-restore-coolify.md
description: >-
  Backup and restore your Coolify instance with S3 or manual methods including
  database migration, SSH key transfer, and APP_KEY configuration.
---

# Backup and Restore Your Coolify Instance

This guide will show you how to back up your Coolify instance and restore it on a new server.

There are two methods to create backups:

* **S3 Backup:** Use S3-compatible storage to automatically save backups.
* **Manual Backup:** Trigger a backup manually from the Coolify dashboard.

If you use S3-compatible storage, simply download the backup file from your S3 provider and transfer it to your new server.

The rest of this guide will focus on the manual backup method, which is ideal for most users.

::: warning NOTE:
This only backs up and restores the Coolify instance itself â€” not your application data.

All settings from your Coolify dashboard will be restored, but application data (such as volume mounts) must be backed up and restored manually.

For details, refer to the [Application Migration Guide](https://coolify.io/docs/knowledge-base/how-to/migrate-apps-different-host).
:::

## 1. Create a Manual Backup

1. **Go to Backup Page on Dashboard:**\
   In your Coolify dashboard, click on **Settings** and select the **Backup** tab to view your database and backup settings.


2. **Trigger a Backup:**\
   Click on the **Backup Now** button. This will start the backup process in the background.


3. **Download or Copy Backup Location:**\
   Once the backup is complete, you will see a **Download** button and a location path in the UI.\

   * **Download:** Saves the backup file to your local computer.
   * **Copy Path:** You can use this path with a tool like SCP to transfer the backup file directly to your new server.

::: info **Note:**
If you are using S3-compatible storage for backups, download the backup file from your S3 provider instead
:::

## 2. Retrieve Your `APP_KEY`

Before you restore the backup, you need to obtain the `APP_KEY` from your current Coolify instance. This key is used to decrypt your data during restoration.

1. **Open the Terminal in Coolify:**\
   Access the **Terminal** tab in the dashboard and connect to the server where Coolify is running. This server is named as `localhost` by default.

2. **View the Environment File**\
   Run the following command to display the contents of the `.env` file:
   ```sh
   cat /data/coolify/source/.env
   ```
   Copy the value of `APP_KEY` and save it securely. This key is important for the restoration process.

::: danger **IMPORTANT**
Save this `APP_KEY` safely. Without it, you cannot restore your backup.
:::

## 3. Back Up Your Coolify SSH Private and Public Key

Coolify generates one (or more) SSH key files under `/data/coolify/ssh/keys`. If you restore Coolify onto a new machine, you must bring those key files along so your managed servers remain reachable.

1. **Locate the SSH Key on the Old Host:**

   ```sh
   ls -l /data/coolify/ssh/keys
   ```

   You should see one or more files named like:

   ```sh
   ssh_key@<random_id1>
   ssh_key@<random_id2>
   ssh_key@<random_id3>
   ```

   Each `ssh_key@â€¦` entry represents an ED25519 key that Coolify uses to SSH into your servers.

2. **Copy all these SSH key files to your new host server and store them in a secure location (we will need this later on this guide).**

3. **Retrieve public keys:**

   Retrieve the public keys from your old server's `~/.ssh/authorized_keys` file and append them to the new server's `~/.ssh/authorized_keys` file (do not replace existing entries).

## 4. Prepare Your New Server

Set up your new server where you will restore your Coolify instance.

1. **Install a Fresh Coolify Instance:**\
   Follow the [installation instructions](/get-started/installation) to install Coolify on your new server.

   Be sure to include the correct version number (example: `-s 4.0.0-beta.400`) at the end of the installation script to ensure you're installing the same Coolify version as before.

   For example, to install version `4.0.0-beta.400`, use this command:

   ```sh
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash -s 4.0.0-beta.400
   ```

   Remember to replace `4.0.0-beta.400` with the desired version number.

2. **Verify the Installation:**\
   Access your new Coolify instance on your browser. A fresh installation will show the registration page, indicating that no data exists yet.

## 5. Transfer and Restore the Backup

1. **Transfer the Backup File:**\
   Copy the backup file and SSH keys to the new server. You can do this via SCP, FTP, or any other secure file transfer method.

2. **Stop Coolify:**
   ```sh
   docker stop coolify coolify-redis coolify-realtime coolify-proxy
   ```

3. **Run the Restore Command:**\
   Use the PostgreSQL restore tool to import your backup into the database container.

   ```sh
   cat /path/to/your_backup_file \
     | docker exec -i coolify-db \
       pg_restore --verbose --clean --no-acl --no-owner -U coolify -d coolify
   ```

   You have to replace `/path/to/your_backup_file` with the path of your backup file on the server.

   ::: warning Note:
   Some warnings about existing foreign keys or sequences might appear, these can usually be ignored if the base structure remains intact.
   :::

## 6. Replace the Auto-Generated SSH Key

Replace the key files under `/data/coolify/ssh/keys`.

1. **Remove any auto-generated keys:**

```sh
rm -f /data/coolify/ssh/keys/*
```

2. **Move your old key files into** `/data/coolify/ssh/keys/`

   These are the files you copied to the new host server on [step 3](#_3-back-up-your-coolify-ssh-private-and-public-key)

## 7. Update Environment Settings for Restoration

After restoring the backup, update your environment configuration to allow the new instance to use the old data.

1. **Edit the Environment File:**\
   Open the `.env` file with your preferred text editor:
   ```sh
   nano /data/coolify/source/.env
   ```

2. **Add the Previous APP Key:**\
   Add a new environment variable called `APP_PREVIOUS_KEYS` and paste the value of `APP_KEY` you saved earlier:
   ```yaml
   APP_PREVIOUS_KEYS=your_previous_app_key_here
   ```
   Save and exit the editor.

## 8. Restart Coolify

To apply the restored backup and updated environment settings, restart your Coolify instance using the install script.

1. **Run the Installation Script:**\
   Re-run the Coolify installation command:
   ```sh
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash -s 4.0.0-beta.400
   ```
   Remember to replace `4.0.0-beta.400` with the desired version number.

2. **Verify the Restoration:**\
   Visit your Coolify dashboard URL and log in with the same credentials from your previous instance. Your projects, deployments, and settings should now be restored.

## Troubleshooting

* **500 Error on Login or Project Access:**\
  Double-check that the `APP_PREVIOUS_KEYS` variable is correctly set in your `.env` file.

* **Permission Denied Errors:**\
  If you encounter permission issues while accessing directories, change the ownership of the `/data/coolify` directory. Since Coolify uses the root user account, ensure that the ownership is set to **root**:
  ```sh
  sudo chown -R root:root /data/coolify
  ```

* **Server is not reachable (Permission denied):**
  If Coolify cannot SSH into your servers because it doesnâ€™t have the same key files.

  Make sure you copied all of `/data/coolify/ssh/keys/` from the old host, and then placed them under `/data/coolify/ssh/keys/` on the new host. If those files do not exactly match what was on the old server, you will see this error.

  Also, ensure that the corresponding public key from the old host's `authorized_keys` file is added to the new host's `~/.ssh/authorized_keys`.

---

---
url: /docs/databases/backups.md
description: >-
  Configure scheduled database backups for PostgreSQL, MySQL, MariaDB, and
  MongoDB with cron expressions and S3 storage integration.
---

# Backups

Scheduled database backups could be configured for PostgreSQL and for Coolify itself.

This schedules are based on cron expressions, so you can configure them to run as often as you want.

You can also use simple cron expressions like:

```js
const VALID_CRON_STRINGS = [
    'every_minute' => '* * * * *',
    'hourly' => '0 * * * *',
    'daily' => '0 0 * * *',
    'weekly' => '0 0 * * 0',
    'monthly' => '0 0 1 * *',
    'yearly' => '0 0 1 1 *',
];
```

## PostgreSQL

Coolify creates a full backup of your PostgreSQL databases. You can specify which database to backup, with a comma separated list.

::: info Tip
Coolify own database is also backed up using this method.
:::

### Backup command

```bash
pg_dump --format=custom --no-acl --no-owner --username <username> <databaseName>
```

### Restore command

The backup has custom format, so you can restore it using the following command (or with any equivalent tool):

```bash
pg_restore --verbose --clean -h localhost -U postgres -d postgres pg-dump-postgres-1697207547.dmp
```

## MySQL

```bash
mysqldump -u root -p <password> <datatabaseName>
```

## MariaDB

```bash
mariadb-dump -u root -p <password> <datatabaseName>
```

## MongoDB

```bash
mongodump --authenticationDatabase=admin --uri=<uri> --gzip --archive=<archive>
```

Or if you exclude some collections:

```bash
mongodump --authenticationDatabase=admin --uri=<uri> --gzip --archive=<archive> --excludeCollection=<collectionName> --excludeCollection=<collectionName>
```

## S3 Backups

You can also define your own [S3 compatible](/knowledge-base/s3/introduction) storage to store your backups.

---

---
url: /docs/troubleshoot/applications/bad-gateway.md
description: >-
  Fix Bad Gateway (502) errors in Coolify by checking port configuration, host
  mapping, listening addresses, and container health.
---

# Bad Gateway (502) Error

If your deployed application **maybe** works when you access it via your serverâ€™s IP address and port but shows a **Bad Gateway** error on your domain, the issue is most often due to misconfigured port settings, incorrect host mapping, or your app listening only on localhost.

## Whatâ€™s an Application and What's a Service?

* **Application:** An Application is deployed by you using a Git repository or any deployment option **except** the one-click service.

* **Service:** A Service is an app deployed using a Compose file or the one-click service on Coolify. These deployments may have different network settings and UI sections (for example, you might not see the Network section in your UI).

## Symptoms

* The application **maybe** accessible via the server IP with a port number but not via the domain.

## Diagnosis

* **Port Configuration:**

  * **Applications:** Make sure the port your app is listening on is correctly entered in the **Port Exposes** field on the Coolify dashboard.
  * **Services:** Check that your Compose or one-click service configuration has the appropriate network configuration.

* **Host Mapping:**

  * **Applications:** Verify that the applicationâ€™s port is not incorrectly mapped to the host system.
  * **Services:** Confirm that any port mapping in your Compose file or service configuration aligns with the proxy routing requirements.

* **Listening Address:** Check if the app is only listening to `localhost` inside the container. It should be configured to listen on all network interfaces (`0.0.0.0`).

* **Domain Port Inclusion:** Make sure your domain URL includes the correct port number if required.

* **Container Status:** Check the status of the container where your app or service is running. Is it unhealthy? Stuck at Starting? A failing health check might be the reason.

## Solution

* **Update Port Settings:** Enter the correct port number in the **Port Exposes** field on the Coolify dashboard and restart your app.

* **Remove Host Port Mapping:** If the port is mapped to the host system, remove the mapping so the proxy can route traffic correctly, then restart your app.

* **Adjust Listening Address:** Change your application so it listens on all network interfaces (`0.0.0.0`) instead of just `localhost`.

* **Correct Domain URL:** Add the correct port number at the end of your domain URL if needed, and restart your application.

* **Restart Container / Check Logs:** Restart the container or check its logs to diagnose the issue.


## Support

If these steps donâ€™t solve the issue, consider reaching out for further assistance by joining our [Discord community](https://coolify.io/discord) and sharing your app logs, coolify proxy logs, configuration screenshots, and details of the troubleshooting steps youâ€™ve already tried.

---

---
url: /docs/knowledge-base/proxy/traefik/basic-auth.md
description: >-
  Protect Coolify applications and services with Traefik basic authentication
  middleware using htpasswd credentials for standard and Docker Compose
  deployments.
---

# Basic Auth Middleware

The configuration is slightly different for [`Standard Applications`](#standard-applications) and [`Docker Compose based applications/one-click services`](#docker-compose-and-services).

## Standard Applications

```bash
traefik.http.middlewares.<random_unique_name>.basicauth.users=test:$2y$12$ci.4U63YX83CwkyUrjqxAucnmi2xXOIlEF6T/KdP9824f1Rf1iyNG
traefik.http.routers.<unique_router_name>.middlewares=<random_unique_name>
```

In the example above, we are using `test` as username and `test` as password.

::: info
You most likely have a `traefik.http.middlewares` label already set. In that case, you must append the `random_unique_name` middleware to the existing value.
For example:

```bash
traefik.http.routers.<unique_router_name>.middlewares=gzip,<random_unique_name>
```

:::

Note: The `<random_unique_name>` and `<unique_router_name>` are placeholders. You need to replace them when you add them to your own labels section.
The `<random_unique_name>` is a unique name for the middleware and you need to make that up yourself. The `<unique_router_name>`
is the unique name for the router that Coolify has already generated for you.

### An ngnix Simple Web Container Example

Let's say you have an ngnix simple web container that was generated by Coolify with the following Dockerfile:

```Dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
```

The  `Container Labels` generated by Coolify would look like this:

```bash
traefik.enable=true
traefik.http.middlewares.gzip.compress=true
traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https
traefik.http.routers.http-0-wc04wo4ow4scokgsw8wow4s8.entryPoints=http
traefik.http.routers.http-0-wc04wo4ow4scokgsw8wow4s8.middlewares=redirect-to-https
traefik.http.routers.http-0-wc04wo4ow4scokgsw8wow4s8.rule=Host(`ngnixsite.mysite.com`) && PathPrefix(`/`)
traefik.http.routers.http-0-wc04wo4ow4scokgsw8wow4s8.service=http-0-wc04wo4ow4scokgsw8wow4s8
traefik.http.routers.https-0-wc04wo4ow4scokgsw8wow4s8.entryPoints=https
traefik.http.routers.https-0-wc04wo4ow4scokgsw8wow4s8.middlewares=gzip
traefik.http.routers.https-0-wc04wo4ow4scokgsw8wow4s8.rule=Host(`ngnixsite.mysite.com`) && PathPrefix(`/`)
traefik.http.routers.https-0-wc04wo4ow4scokgsw8wow4s8.service=https-0-wc04wo4ow4scokgsw8wow4s8
traefik.http.routers.https-0-wc04wo4ow4scokgsw8wow4s8.tls.certresolver=letsencrypt
traefik.http.routers.https-0-wc04wo4ow4scokgsw8wow4s8.tls=true
traefik.http.services.http-0-wc04wo4ow4scokgsw8wow4s8.loadbalancer.server.port=80
traefik.http.services.https-0-wc04wo4ow4scokgsw8wow4s8.loadbalancer.server.port=80
caddy_0.encode=zstd gzip
caddy_0.handle_path.0_reverse_proxy={{upstreams 80}}
caddy_0.handle_path=/*
caddy_0.header=-Server
caddy_0.try_files={path} /index.html /index.php
caddy_0=https://ngnixsite.73rdst.com
caddy_ingress_network=coolify
```

If you want to add basic authentication to this service, assuming you want to name your auth middleware `mybasicauth`, you could add the following label below the
first line `traefik.enable=true`:

`traefik.http.middlewares.mybasicauth.basicauth.users=test:$2y$12$ci.4U63YX83CwkyUrjqxAucnmi2xXOIlEF6T/KdP9824f1Rf1iyNG`

Notice that `mybasicauth` has replaced the `<random_unique_name>` placeholder. In other words, you have named your own auth middleware `mybasicauth`.

Then you need to add the middleware to the router label, and since one or more middlewares are already set, you need to append the new middleware to the existing value.

For example you would update the current line

`traefik.http.routers.https-0-wc04wo4ow4scokgsw8wow4s8.middlewares=gzip`

to:

`traefik.http.routers.https-0-wc04wo4ow4scokgsw8wow4s8.middlewares=gzip,mybasicauth`

Notice that in this case `<unique_router_name>` has been replaced with `https-0-wc04wo4ow4scokgsw8wow4s8` which is the unique name for the router that Coolify has already generated for you.

Your `ngnix` simple web container is protected by basic authentication.

## Docker Compose And Services

To add `basicauth` middleware to your service, you need to add the following labels to your `docker-compose.yml` file.:

```yaml
services:
  ngnix-simple-web-container::
    image: 'nginx:alpine'
    ports:
      - '8080:80'
    labels:
      - 'traefik.http.middlewares.<random_unique_name>.basicauth.users=test:$2y$12$ci.4U63YX83CwkyUrjqxAucnmi2xXOIlEF6T/KdP9824f1Rf1iyNG'
```

You should replace the placeholders `<random_unique_name>` with a unique name for the middleware. For example, you might name it `mybasicauth`, and then
replace the placeholder with `mybasicauth`. That label would then look like this:

```yaml
labels:
  - 'traefik.http.middlewares.mybasicauth.basicauth.users=test:$2y$12$ci.4U63YX83CwkyUrjqxAucnmi2xXOIlEF6T/KdP9824f1Rf1iyNG'
```

We have now added `basicauth` middleware to the `nginx-simple-web-container` service.

Your `ngnix` simple web container is protected by basic authentication with a username of test and password of test.

Note: When applying basic authentication labels, special characters like $, @, and , must be escaped to avoid parsing errors.
That is for example, enclose the label values in quotes and use a backslash () before special characters if you're using double quotes.

## How to generate user/password?

You need to set your username and password in the `basicauth.users` label.

You can generate one with the [htpasswd](https://httpd.apache.org/docs/current/programs/htpasswd.html) command:

```bash
htpasswd -nbB test test
```

This will generate a password hash for the user `test` with the password `test`.
You can then replace `test` with the desired username and password. Then substitute the generated hash in the `basicauth.users` label above.

Note: the `htpasswd` command is available on most Linux distributions. It is part of the `apache2-utils` package on Debian/Ubuntu and
can be found [here](https://httpd.apache.org/docs/current/programs/htpasswd.html).

---

---
url: /docs/services/beszel.md
description: >-
  Deploy Beszel lightweight server monitoring on Coolify with real-time metrics,
  Docker stats, and minimal resource usage for infrastructure tracking.
---

## What is Beszel?

Lightweight server monitoring hub with historical data, docker stats, and alerts.

## Setup

* Deploy Beszel using Coolify template
* In the UI, `Add a new System`
* Enter `beszel-agent` in Host/IP
* Copy the public Key to `KEY` env variable and token to `TOKEN` variable in Beszel's project environment variables (These are obtained from Beszel UI when adding a new system)

## Links

* [GitHub](https://github.com/henrygd/beszel)

---

---
url: /docs/services/bitcoin-core.md
description: >-
  Run Bitcoin Core full node on Coolify for decentralized cryptocurrency network
  participation, wallet management, and blockchain validation.
---

# Bitcoin Core

## What is Bitcoin Core

A self-hosted Bitcoin Core full node.

## Public Node vs. Private Use

By default, Coolifyâ€™s Bitcoin Core service is configured for private/internal use. This means it is intended for connecting wallets or apps from the same server or private network, and **does not accept inbound P2P connections from the public internet**. This is a security-conscious default to help reduce the attack surface, especially for new users.

### How to Run a Public Node

If you want your Bitcoin node to be a fully public peer (accepting inbound connections from other nodes):

1. **Expose the P2P port in your Compose file:**\
   Add the following under your `bitcoin-core` service:
   ```text
   ports:
   - "8333:8333"
   ```

2. **Open port 8333 in your serverâ€™s firewall:**

* On Ubuntu with UFW:
  ```bash
  sudo ufw allow 8333/tcp
  ```
* On CentOS with firewalld:
  ```bash
  sudo firewall-cmd --add-port=8333/tcp --permanent
  sudo firewall-cmd --reload
  ```
* For cloud servers, update your providerâ€™s security group or firewall rules to allow inbound TCP on port 8333.

### Considerations

* **Default Behavior:**\
  Without the `ports` section, your node will not accept inbound P2P connections, but can still make outbound connections and fully sync the blockchain.
* **Security:**\
  Not exposing 8333 by default helps protect users who may not understand the implications of running a public Bitcoin node.
* **Advanced Users:**\
  If you understand the risks and want to contribute more fully to the Bitcoin network, follow the steps above to run a public node.

## Links

* [Official Documentation](https://hub.docker.com/r/ruimarinho/bitcoin-core/?utm_source=coolify.io)

---

---
url: /docs/services/bluesky-pds.md
description: Host a Bluesky Personal Data Server with Coolify
---

# Bluesky PDS

## What is a Bluesky PDS?

Bluesky PDS (Personal Data Server) is a self-hosted data server that stores your data in the AT Protocol network. It allows you to control your own social media data and identity while still participating in the AT Protocol network. The PDS handles user accounts, posts, followers, and other social data in a decentralized manner.

## Setting a domain with https if already not set

Pdsadmin requires you to have https in your Bluesky PDS, make sure you have set a domain with https in the Coolify UI and check the environment variables so it matches it.

## Creating an account in your PDS

To create an account and start using your PDS, you can use the following pdsadmin commnands in the Terminal tab of the Coolify UI:

```bash
pdsadmin create-invite-code
```

or

```bash
pdsadmin account create <email> <handle>
```

To check for other available commands in pdsadmin, you can simply run `pdsadmin`

## Setting up mail

Mailing is important for a Bluesky PDS, it's needed to confirm email, and other things!

You need to edit 2 environment variables in the Coolify UI, head to the Environment Variables tab and look for the `PDS_EMAIL_FROM_ADDRESS`, what you need to fill here is pretty much self explanatory, is the email address that's going to be used when sending an email, for example: `user@domain.com`

The next environment variable is `PDS_EMAIL_SMTP_URL`, this one is not very self explanatory, but here's how to fill it:

There are many ways to fill this variable, here are some examples:

`smtps://user%40example.com:password@mail.example.com:465` (SMTP with SSL)

`smtp://user%40example.com:password@mail.example.com:587` (SMTP without SSL)

`smtps://resend:<your Resend api key>@smtp.resend.com:465` (Resend)

You might need to URL-encode your username and password for the Mail Setup to work.

And that's it, your PDS should be ready for you to use, it will work like any other PDS!

## Links

* [The official website](https://blueskyweb.xyz?utm_source=coolify.io)
* [GitHub](https://github.com/bluesky-social/pds?utm_source=coolify.io)

---

---
url: /docs/services/bookstack.md
description: >-
  Deploy BookStack wiki on Coolify for organized documentation with WYSIWYG
  editor, hierarchical structure, search, and team collaboration features.
---

# Bookstack

## What is Bookstack

BookStack is a simple, self-hosted, easy-to-use platform for organising and storing information

## Links

* [Official Documentation](https://www.bookstackapp.com/docs/?utm_source=coolify.io)

---

---
url: /docs/services/browserless.md
description: >-
  Run Browserless on Coolify for headless Chrome automation, web scraping, PDF
  generation, and screenshot services via simple REST API.
---

## What is Browserless

Browserless is a platform that provides headless browser automation and management services. It allows developers to run automated browser tasks without the need for manual intervention, making it ideal for web scraping, testing, and rendering tasks.

## Example use cases

* Web Scraping: Automate the collection of data from websites, such as product prices, news articles, or social media content, without worrying about CAPTCHAs, JavaScript rendering, or rate limits.

* Automated Testing: Run browser-based tests for web applications using tools like Puppeteer or Selenium to check functionality, compatibility, and performance across different browsers.

* PDF Generation: Convert webpages or HTML content into PDFs automatically, which is useful for invoicing, reporting, or archiving purposes.

* Website Monitoring: Automate the monitoring of websites for uptime, broken links, or content changes, ensuring everything is functioning as expected without manually visiting the site.

* SEO Audits: Use Browserless to run scripts that crawl your website, analyzing metadata, tags, and other factors that impact SEO, ensuring your site follows best practices.

## Key Features

* Headless Browser Automation: Supports running headless browsers, automating tasks with Puppeteer, Playwright, and Selenium without manual browser operation.

* Cloud-Based Infrastructure: Run scripts in the cloud, reducing the need to manage your own browser environments and infrastructure.

* Pre-Built APIs: Offers APIs for common tasks like screenshotting, PDF generation, and web scraping, simplifying integration.

* Scalability: Easily scale automation tasks across many concurrent browser sessions.

* Logging & Debugging Tools: Detailed logging and debugging tools for tracking and troubleshooting automated browser sessions.

## Images

![templates](https://cdn.prod.website-files.com/65cb4923a3a6b08fe1124094/6601a7a5b8508b353addd84f_social-preview.jpg)

## Links

* [The official website](https://www.browserless.io?utm_source=coolify.io)
* [Documentation](https://docs.browserless.io?utm_source=coolify.io)
* [GitHub](https://github.com/browserless?utm_source=coolify.io)
* [Api Documentation](https://docs.browserless.io/docs/api.html?utm_source=coolify.io)
* [Pricing](https://www.browserless.io/pricing?utm_source=coolify.io)

---

---
url: /docs/services/budge.md
description: >-
  Manage finances with Budge on Coolify offering budget tracking, expense
  categorization, financial goals, and spending insights for personal finance.
---

## What is BudgE?

BudgE (pronounced "budgie", like the bird) is an open source "budgeting with envelopes" personal finance app, taking inspiration from other tools such as [Aspire Budgeting](https://www.aspirebudget.com?utm_source=coolify.io), [budgetzero](https://budgetzero.io?utm_source=coolify.io), and [Buckets](https://www.budgetwithbuckets.com/?utm_source=coolify.io).

## Current Features

* Multi user support
* Envelope budgeting with monthly rollover
* Transaction management for accounts
* Standard bank account management
* Credit card management with payment handling
* Tracking accounts
* Export account transactions
* CSV transaction import

## Screenshots

![screenshot1](https://raw.githubusercontent.com/linuxserver/budge/main/images/budget.png)

![screenshot2](https://raw.githubusercontent.com/linuxserver/budge/main/images/account.png)

## Support

* [Discord](https://discord.gg/hKJWjDqCBz)

## Links

* [GitHub](https://github.com/linuxserver/budge?utm_source=coolify.io)

---

---
url: /docs/services/budibase.md
description: >-
  Build internal apps on Coolify with Budibase low-code platform featuring
  database integration, workflow automation, and custom business applications.
---

# Budibase

## What is Budibase

Low code platform for building business apps and workflows in minutes. Supports PostgreSQL, MySQL, MSSQL, MongoDB, Rest API, Docker, K8s, and more.

## Links

* [Official Documentation](https://docs.budibase.com/docs/docker-compose?utm_source=coolify.io)

---

---
url: /docs/services/bugsink.md
description: >-
  Deploy Bugsink error tracking on Coolify for application monitoring, exception
  logging, stack traces, and debugging insights for development teams.
---

## What is Bugsink?

[Bugsink](https://www.bugsink.com/?utm_source=coolify.io) offers [error tracking](https://www.bugsink.com/error-tracking/?utm_source=coolify.io) for your applications with
full control through self-hosting.

* [Built to self-host](https://www.bugsink.com/built-to-self-host/?utm_source=coolify.io)
* [Sentry-SDK compatible](https://www.bugsink.com/sentry-sdk-compatible/?utm_source=coolify.io)
* [Scalable and reliable](https://www.bugsink.com/scalable-and-reliable/?utm_source=coolify.io)

## Screenshots

## Links

* [The official website](https://www.bugsink.com/?utm_source=coolify.io)
* [GitHub](https://github.com/bugsink/bugsink/?utm_source=coolify.io)

---

---
url: /docs/applications/build-packs/overview.md
description: >-
  Choose from Nixpacks, Static, Dockerfile, or Docker Compose build packs to
  create optimized Docker images for your application deployments.
---

Coolify deploys every application as a Docker container. This means your application runs in its own isolated container.

To run a container, you need a Docker image built from your source code.

Build packs helps to create this Docker image and manage the build and deployment process.

## Why Use Build Packs?

* **Simplifies the Build Process:** Some Build packs automatically create the Docker image needed for deployment, so you donâ€™t have to spend time on learning how to write Dockerfiles on your own.

* **Flexibility for Different Projects:** Since every application is different, you can choose a build pack that suits your specific needs, whether you prefer an automated solution or a custom configuration.

## How Build Packs Work

Each build pack offers a different approach to building your Docker image:

* **Automated Dockerfile Creation:** Build packs like Nixpacks & Static Build Pack automatically generate a Dockerfile based on your codebase and builds the docker image.
  * This allows you to deploy your application quickly without having to write the Dockerfile yourself.

* **Custom Dockerfile or Docker Compose:** Build packs like Dockerfile & Docker Compose let you use a Dockerfile or Docker Compose file that you have already have on your codebase.
  * This gives you full control over how your Docker image is built and how multiple services work together.

## Choose the Right Build Pack

Coolify have four build packs to meet different requirements:

* **Nixpacks:** Good for quick and automated Docker image creation with minimal configuration.

* **Static Build Pack:** Perfect for static sites and simple applications that donâ€™t need server-side processing.

* **Dockerfile:** Use your own Dockerfile, if you want full control over the docker image build process.

* **Docker Compose:** Perfect to Deploy complex, multi-service applications using your custom Docker Compose file.

## How to use a Build Pack

Each build pack has its own step-by-step guide to help you use them in Coolify. Click the links below to learn more about each build pack.

* [Static Build Pack](/builds/packs/static)
* [Nixpack](/builds/packs/nixpacks)
* [Dockerfile](/builds/packs/dockerfile)
* [Docker Compose](/builds/packs/docker-compose)

---

---
url: /docs/knowledge-base/server/build-server.md
description: >-
  Set up a build server in Coolify to separate your build process from
  deployment, reduce load, and improve performance.
---

A build server allows you to compile your projects separately from the server that hosts your live application.

This helps to keep the load on your hosting server low and ensures that your application's performance remains unaffected by the build process.

## Requirements

Before you set up a build server, make sure that:

* The final images are pushed to a container registry.
* The build server is authenticated with the container registry. See [this guide](/knowledge-base/docker/registry) for more details.
* The build server has access to your source code.
* Docker Engine is installed on the build server.
* The build server's architecture matches that of your deployment servers.

::: success Tip:
If you have multiple build servers, Coolify will select one at random.
:::

## How to Use a Build Server

To start using a build server with Coolify, follow these steps:

1. **Add a New Server to Coolify:**
   In your Coolify dashboard, go to the servers page and click the **+ Add** button.

   * If you have already connected a server to Coolify, you can skip this step and go to the next one.

2. **Enable the Build Server Feature:**
   In the popup modal, enable the **Build Server** feature.


   * If you have already connected your server, enable the Build Server feature as shown in the image below.

::: warning HEADS UP!
As of **Coolify v4.0.0-beta.408** you cannot deploy any application to a server that is marked as a build server.

If you want to deploy apps, uncheck the build server option on your server from the servers page in the Coolify dashboard.

## Configuring a Resource to Use a Build Server

To assign a build server to an existing resource, follow these steps:

1. **Go to Your Resource:**
   In your Coolify dashboard, navigate to the general settings of the application you want to use the build server for.

2. **Activate the Build Server Option:**
   Under the **Build** section, enable the `Use a Build Server ?` option.

3. **Set Up Your Container Registry:**
   Make sure that your build server is authenticated with the container registry. See [this guide](/knowledge-base/docker/registry) for more details.

---

---
url: /docs/knowledge-base/proxy/caddy/basic-auth.md
description: >-
  Add password protection to Coolify applications with Caddy basic
  authentication using hash-password CLI for secure credential management.
---

# Caddy Basic Auth

Basic authentication provides an extra layer of security for your applications by requiring a username and password to access protected resources.

With Coolify, you can easily integrate basic auth into your Caddy web server configuration.

## Why Use Basic Auth with Caddy?

1. **Enhanced Security:** Adds an extra barrier to prevent unauthorized access.
2. **Simplicity:** Straightforward configuration that integrates directly into your Caddy setup.
3. **Flexibility:** Configure different credentials for different services as needed.

## 1. Generate a Hashed Password

For Caddy to validate credentials securely, your password must be hashed using Caddy's built-in tool. The basic auth credential is set as:

```sh
caddy_0.basicauth.<username>="<hashed_password>"
```

The `<hashed_password>` **must be generated with the Caddy CLI** using the `caddy hash-password` command.

### How to Generate a Hashed Password

1. Open your terminal.

2. Run the following command:

   ```sh
   caddy hash-password --plaintext "your_plaintext_password"
   ```

   Replace `"your_plaintext_password"` with your actual password.

3. The output will be a hashed password that you can use directly in your Caddy configuration.

For more details and advanced options (like choosing a different algorithm), refer to the [Caddy CLI documentation](https://caddyserver.com/docs/command-line#caddy-hash-password?utm_source=coolify.io).

## 2. Configure Basic Auth in Coolify

Once you have your hashed password, integrate it into your Coolify configuration.

1. **Add the Basic Auth Entry:**

   * Add the following line to the Caddyfile of the application where you want to enable basic authentication:
     ```sh
     caddy_0.basicauth.<username>="<hashed_password>"
     ```
     * Replace `<username>` with your desired username and `<hashed_password>` with the output from the `caddy hash-password` command:

2. **Apply the Configuration:**
   * Save your configuration changes.
   * Restart your application to apply the new settings.

::: warning Note
Make sure that your hashed password is generated **only** using the Caddy CLI.

Using an unrecognized hash method may result in authentication failures.
:::

---

---
url: /docs/knowledge-base/proxy/caddy/overview.md
description: >-
  Use Caddy reverse proxy with Coolify for automatic SSL certificates, simple
  configuration, and HTTP/2 support as an alternative to Traefik.
---

# Caddy Proxy

[Caddy](https://caddyserver.com/) is an easy-to-use, open-source web server and reverse proxy that automatically manages SSL/TLS certificates. It's known for its simplicity and automation, especially when it comes to securing your websites.

While [Traefik](https://traefik.io/) is the default reverse proxy used in Coolify, Caddy is another option you can explore if you prefer its simplicity or unique features.

## Why Use Caddy?

* Caddy automatically generates and renews SSL certificates for your sites, making it extremely easy to secure your applications.
* Caddy uses a simple, declarative configuration file (Caddyfile), making it beginner-friendly.
* Caddy comes with features like reverse proxying, load balancing, HTTP/2, and more out of the box without needing extra plugins.
* If youâ€™re looking for a proxy that â€œjust worksâ€ with minimal configuration, Caddy can be a great choice.

## When Not to Use Caddy?

* If you need advanced proxying features like dynamic routing, middleware, or complex load balancing, Traefik might be a better choice.
* Since Coolify primarily uses Traefik, certain configurations in Caddy might require additional manual setup.

## A Note from the Coolify Team

While Caddy is a fantastic tool for certain use cases, **we highly recommend** using **Traefik** over Caddy for most Coolify setups.

The [Core team](/get-started/team) primarily uses Traefik, and it is the default reverse proxy configured within Coolify.

Only consider using Caddy if you're familiar with it or need specific features that Traefik cannot provide.

At the moment, we do not have detailed guides for Caddy because it is not our primary reverse proxy, and using it may require more manual configuration.

If you choose to use Caddy, please make sure you are comfortable with configuring it yourself.

---

---
url: /docs/services/calcom.md
description: >-
  Host Cal.com scheduling platform on Coolify with calendar integration, team
  booking, payment processing, and customizable appointment workflows.
---

# Calcom

## What is Calcom

Scheduling infrastructure for everyone.

## Deploying on x86 (amd64)

You need to change default docker compose to the following to make cal.com work on x86 (amd64):

```yaml
services:
  calcom:
    image: 'calcom/cal.com:<VERSON compatible with amd64>
    platform: linux/amd64
    (... same ...)
```

You can check the latest amd64 compatible version [here](https://hub.docker.com/r/calcom/cal.com/tags).

Example:

```yaml
services:
  calcom:
    image: 'calcom/cal.com:v5.9.0
    platform: linux/amd64
    (... same ...)
```

## Links

* [Official Documentation](https://cal.com/docs/developing/introduction?utm_source=coolify.io)

---

---
url: /docs/services/calibre-web.md
description: >-
  Run Calibre Web on Coolify for ebook library management with OPDS feeds,
  reading interface, format conversion, and metadata editing features.
---

# Calibre Web

## What is Calibre Web

Calibre web is a web app providing a clean interface for browsing, reading and downloading eBooks.

## Links

* [Official Documentation](https://github.com/linuxserver/docker-calibre-web?utm_source=coolify.io)

---

---
url: /docs/services/cap.md
description: Here you can find the documentation for hosting Cap with Coolify.
---

## What is Cap?

Cap is the open source alternative to Loom. Lightweight, powerful, and cross-platform. Record and share in seconds.

## How to self-host

There are two storage options: you can store the video data on a remote storage service like S3 or R2, or you can choose the less recommended option of storing it directly on the local VPS (or another VPS) via a MinIO service.

### Option 1: Remote S3-compatible storage (AWS S3, Cloudflare R2, etc.)

Set these environment variables:

* `CAP_AWS_ACCESS_KEY`: Your S3/R2 access key
* `CAP_AWS_SECRET_KEY`: Your S3/R2 secret key
* `CAP_AWS_BUCKET`: Your S3/R2 bucket name
* `CAP_AWS_REGION`: Your S3/R2 region (e.g., us-east-1, auto for R2)
* `CAP_AWS_ENDPOINT`: Your S3/R2 endpoint URL
* `S3_PUBLIC_ENDPOINT`: Public endpoint for your bucket (same as CAP\_AWS\_ENDPOINT for most cases)
* `S3_INTERNAL_ENDPOINT`: Internal endpoint (same as CAP\_AWS\_ENDPOINT for most cases)
* `S3_PATH_STYLE`: true for R2/most S3-compatible, false for AWS S3 virtual-hosted style

### Option 2: Local MinIO storage

Deploy MinIO as a separate service in the same network and set:

* `CAP_AWS_ACCESS_KEY`: MinIO root user
* `CAP_AWS_SECRET_KEY`: MinIO root password
* `CAP_AWS_BUCKET`: Your bucket name (e.g., capso)
* `CAP_AWS_REGION`: us-east-1 (or any region)
* `CAP_AWS_ENDPOINT`: http://minio:9000 (internal MinIO endpoint)
* `S3_PUBLIC_ENDPOINT`: http://your-minio-domain:9000 (public MinIO endpoint)
* `S3_INTERNAL_ENDPOINT`: http://minio:9000 (internal MinIO endpoint)
* `S3_PATH_STYLE`: true

## Email Login Links

If the `RESEND_API_KEY` and `RESEND_FROM_DOMAIN` environment variables are not set, login links will be written to the server logs. To send login links via email, you'll need to configure [Resend](https://resend.com):

1. Create an account at [Resend](https://resend.com)
2. Connect a domain and set it as `RESEND_FROM_DOMAIN`
3. Generate an API key and set it as `RESEND_API_KEY`

## How to unlock limits (organization seats and recordings)

1. Open the terminal of the MySQL service
2. Connect to the database: `mysql -u root -p planetscale` and use the `MYSQL_ROOT_PASSWORD` when prompted
3. Run the SQL command below, replacing `your-user-id` with your actual user ID
   ```sql
   UPDATE users SET inviteQuota = 100, stripeSubscriptionId = '12345', subscriptionStatus = 'active' WHERE id = 'your-user-id';
   ```
4. You can verify the changes by running the following command:
   ```sql
   SELECT * FROM users WHERE id = 'your-user-id';
   ```

## Screenshots

## Links

* [The official website â€º](https://cap.so/)
* [GitHub â€º](https://github.com/CapSoftware/Cap)

---

---
url: /docs/services/castopod.md
description: >-
  Deploy Castopod podcast hosting on Coolify with RSS feeds, analytics, social
  features, and fediverse integration for independent podcasters.
---

# Castopod

## What is Castopod

Castopod is a free & open-source hosting platform made for podcasters who want to engage and interact with their audience.

## Links

* [Official Documentation](https://docs.castopod.org/main/en/?utm_source=coolify.io)

---

---
url: /docs/troubleshoot/dns-and-domains/certificate-resolver-doesnt-exist.md
description: >-
  Fix Traefik 'letsencrypt cert resolver not found' errors by setting correct
  acme.json file permissions using chmod 600 for non-root Coolify users.
---

# Certificate Resolver Not Found on Coolify Proxy

If you see the error message `Cert resolver doesn't exist letsencrypt` in the Coolify proxy logs, it typically means that your domain is missing an SSL certificate. This issue often occurs when Coolify is using a non-root user account.

## Symptoms

* The Coolify proxy doesn't generate an SSL certificate for your domain.
* The error `Cert resolver doesn't exist letsencrypt` appears in the Coolify proxy logs.

## Diagnosis

To troubleshoot, check the permissions of the `acme.json` file in the `/data/coolify/proxy` directory by running the following command:

```sh
ls /data/coolify/proxy
```

The output should look something like this:

```sh
-rwxr-x--- 1 shadowarcanist shadowarcanist 32757 Sep  3 15:39 acme.json
-rwxr-x--- 1 shadowarcanist shadowarcanist  1762 Sep  3 18:36 docker-compose.yml
drwxr-x--- 2 shadowarcanist shadowarcanist  4096 Sep  3 15:06 dynamic
```

## Root Cause

When using Coolify with a non-root user account, permissions on the `/data/coolify` directory may not be set correctly.

If the permissions on the `acme.json` file are **too relaxed** (too open), traefik will refuse to use the file. This prevents Traefik from accessing the file and generating SSL certificates.

On the other hand, if permissions are **too strict**, Traefik wonâ€™t be able to read or write to the file either.

Traefik requires the `acme.json` file to have the right level of permission to work properly.

## Solution

To fix this, run the following command to set the correct permissions:

```sh
sudo chmod 600 /data/coolify/proxy/acme.json
```

### What Does `sudo chmod 600` Do?

The `chmod 600` command changes the file permissions of `/data/coolify/proxy/acme.json` so that only the owner of the file (the user account used by Coolify) can read and write to it. This prevents anyone else from accessing or modifying the file while still allowing Traefik to use it.

---

---
url: /docs/services/changedetection.md
description: >-
  Monitor website changes on Coolify with Change Detection featuring automatic
  tracking, alerts, visual diffs, and API endpoint monitoring.
---

![Change Detection](https://raw.githubusercontent.com/dgtlmoon/changedetection.io/master/docs/screenshot.png)

## What is Change Detection?

Detect website content changes and perform meaningful actions - trigger notifications via Discord, Email, Slack, Telegram, API calls and many more.

Live your data-life pro-actively.

## Example use cases

* Products and services have a change in pricing
* *Out of stock notification* and *Back In stock notification*
* Monitor and track PDF file changes, know when a PDF file has text changes.
* Governmental department updates (changes are often only on their websites)
* New software releases, security advisories when you're not on their mailing list.
* Festivals with changes
* Discogs restock alerts and monitoring
* Realestate listing changes
* Know when your favourite whiskey is on sale, or other special deals are announced before anyone else
* COVID related news from government websites
* University/organisation news from their website
* Detect and monitor changes in JSON API responses
* JSON API monitoring and alerting
* Changes in legal and other documents
* Trigger API calls via notifications when text appears on a website
* Glue together APIs using the JSON filter and JSON notifications
* Create RSS feeds based on changes in web content
* Monitor HTML source code for unexpected changes, strengthen your PCI compliance
* You have a very sensitive list of URLs to watch and you do *not* want to use the paid alternatives. (Remember, *you* are the product)
* Get notified when certain keywords appear in Twitter search results
* Proactively search for jobs, get notified when companies update their careers page, search job portals for keywords.
* Get alerts when new job positions are open on Bamboo HR and other job platforms
* Website defacement monitoring
* PokÃ©mon Card Restock Tracker / PokÃ©mon TCG Tracker
* RegTech - stay ahead of regulatory changes, regulatory compliance

## Key Features

* Lots of trigger filters, such as "Trigger on text", "Remove text by selector", "Ignore text", "Extract text", also using regular-expressions!
* Target elements with xPath(1.0) and CSS Selectors, Easily monitor complex JSON with JSONPath or jq
* Switch between fast non-JS and Chrome JS based "fetchers"
* Track changes in PDF files (Monitor text changed in the PDF, Also monitor PDF filesize and checksums)
* Easily specify how often a site should be checked
* Execute JS before extracting text (Good for logging in, see examples in the UI!)
* Override Request Headers, Specify `POST` or `GET` and other methods
* Use the "Visual Selector" to help target specific elements
* Configurable [proxy per watch](https://github.com/dgtlmoon/changedetection.io/wiki/Proxy-configuration?utm_source=coolify.io)
* Send a screenshot with the notification when a change is detected in the web page.

## Links

* [The official website](https://changedetection.io?utm_source=coolify.io)
* [GitHub](https://github.com/dgtlmoon/changedetection.io?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/change-localhost-key.md
description: >-
  Replace and regenerate Coolify's localhost SSH private key with safe database
  backup procedures and Docker container key installation.
---

# Change Localhost Key

This guide will show you how to replace the stored localhost private key for Coolify.

::: warning Caution
Take a backup of the stored private key in the database before starting this operation.
:::

## Key deletion from database

In the Postgres database in which the data for Coolify is stored, there is a private\_keys table.
This table contains the private keys for all servers connected to the Coolify instance.
Be careful to not accidentally delete the wrong keys, as there usually is no way to undo.

1. Navigate to the private\_keys table in the Postgres database for Coolify
   * Said table is located under the public schema in the database.

2. Select the row that is marked with:
   * Row index and ID of 0, as well as the name of "localhost's key"

3. Delete the selected row from the database
   * If completed successfully, proceed to the next section.

::: success Tip
It helps to do this with a graphical interface for managing the database.
:::

## Installing new keys in the host machine

After the key has been deleted from the database, you need to add the new keys into the correct place in the Coolify data folders.

1. Stop your Coolify instance completely.

2. Find the /ssh/keys directory for your Coolify installation.
   * Usually located in /data/ssh/keys if you followed the quick install.

3. Write the public and private keys to the correct files
   * Your ED25519 public key shall be stored in id.root@host.docker.internal.pub
   * Your ED25519 private key shall be stored in id.root@host.docker.internal

4. Start your Coolify instance
   * Coolify will now proceed to seed your keys to the Postgres database.
   * Make sure the Database\Seeders\PopulateSshKeysDirectorySeeder does not error.

::: info Note
If you recieve an output of "SSH key found for the Coolify host machine (localhost)", the operation completed successfully and unless you get any other output, your new key shall now be working.
:::

---

---
url: /docs/services/chaskiq.md
description: >-
  Run Chaskiq customer engagement platform on Coolify with live chat, email
  campaigns, knowledge base, and conversational marketing automation.
---

![Chaskiq](https://user-images.githubusercontent.com/11976/81771025-eaefe780-94af-11ea-881b-ad7910536fee.png)

## What is Chaskiq?

Chaskiq is an open source chat platform that allows you to chat with your customers.

## Links

* [The official website](https://chaskiq.io?utm_source=coolify.io)
* [GitHub](https://github.com/chaskiq/chaskiq?utm_source=coolify.io)

---

---
url: /docs/services/chatwoot.md
description: >-
  Deploy Chatwoot customer support on Coolify with omnichannel inbox, live chat
  widgets, automation rules, and team collaboration for helpdesk.
---

![Chatwoot](https://user-images.githubusercontent.com/2246121/282256632-87f6a01b-6467-4e0e-8a93-7bbf66d03a17.png#gh-dark-mode-only)

## What is Chatwoot?

Chatwoot gives you all the tools to manage conversations, build relationships and delight your customers from one place.

## Links

* [The official website](https://www.chatwoot.com?utm_source=coolify.io)
* [GitHub](https://github.com/chatwoot/chatwoot?utm_source=coolify.io)

---

---
url: /docs/services/checkmate.md
description: >-
  Host Checkmate monitoring on Coolify for uptime checks, SSL certificate
  tracking, domain expiration alerts, and infrastructure health monitoring.
---

# Checkmate

## What is Checkmate

An open source server monitoring application

## Links

* [Official Documentation](https://bluewavelabs.gitbook.io/checkmate?utm_source=coolify.io)

---

---
url: /docs/services/chroma.md
description: >-
  Deploy Chroma vector database on Coolify for AI embeddings storage, semantic
  search, and retrieval-augmented generation in machine learning apps.
---

# Chroma

## What is Chroma?

Chroma is an open-source, AI-native vector database designed for building applications with embeddings. It provides a simple way to store, retrieve, and search vector embeddings for machine learning applications, particularly those involving large language models (LLMs) and semantic search. Chroma handles the complexities of vector operations, similarity search, and metadata filtering, making it ideal for retrieval-augmented generation (RAG) systems and other AI applications.

## Links

* [The official website](https://www.trychroma.com?utm_source=coolify.io)
* [GitHub](https://github.com/chroma-core/chroma?utm_source=coolify.io)

---

---
url: /docs/applications/ci-cd/introduction.md
description: >-
  Learn how Coolify applications integrate with Git providers for continuous
  deployment. Understand the difference between Git-based applications and
  Docker Compose services.
---

# CI/CD with Git Providers

Applications in Coolify are designed to be deployed directly from **Git repositories**, enabling continuous integration and continuous deployment (CI/CD) workflows. This means your applications automatically update when you push code changes to your repository.

## How Git Integration Works

When you deploy an application in Coolify, you connect it to a Git repository from **any Git provider**. Coolify works with all Git platforms, including:

* **[GitHub](/applications/ci-cd/github/integration)** - Full GitHub App integration or deploy keys
* **[GitLab](/applications/ci-cd/gitlab/integration)** - GitLab integration with webhooks
* **[Bitbucket](/applications/ci-cd/bitbucket/integration)** - Bitbucket integration with webhooks
* **[Gitea](/applications/ci-cd/gitea/integration)** - Self-hosted Git platform
* **Any other Git provider** - Works with any Git-compatible platform with publicly accessible repositories or using deploy keys

Once connected, Coolify:

1. **Pulls your source code** from the repository
2. **Builds a Docker image** using your chosen [build pack](/applications/build-packs/overview)
3. **Deploys the container** to your server
4. **Watches for changes** and automatically redeploys when you push new commits (if auto-deploy is enabled)

## Key Benefits of Git-Based Deployments

### Automatic Deployments

Push code to your repository and Coolify automatically builds and deploys your application. No manual intervention needed.

### Preview Deployments

Test pull requests in isolated environments before merging to production. Each PR gets its own unique URL.

### Version Control Integration

* Track deployment history alongside your code commits
* Roll back to previous versions easily
* See exactly what code is running in production

### CI/CD Workflows

* Integrate with GitHub Actions, GitLab CI, and other CI tools
* Run tests before deployment
* Automate complex deployment pipelines

::: tip Alternative: Deploy Without Git
If you want to deploy your own application **without connecting to a Git provider**, you can deploy it as a [Service](/services/introduction) instead. Services allow you to:

* Upload a Docker Compose file directly to Coolify
* Deploy from Docker images without source code
* Manage the application manually without Git integration

This is useful for scenarios where you build your Docker images elsewhere or prefer manual control over deployments.
:::

## Repository Access Methods

Coolify supports multiple ways to access your Git repositories:

### Public Repositories

Simply provide the HTTPS URL of your public repository. No authentication needed. Works with any Git provider.

### Private Repositories

Choose from authentication methods based on your Git provider:

1. **Git Provider App Integration (Recommended for supported providers)**

   * Available for GitHub
   * Full integration with automatic webhooks
   * Pull request deployments
   * Commit status updates
   * No SSH key management

2. **Deploy Keys (Works with any Git provider)**
   * SSH-based authentication
   * Universal support - works with any Git platform
   * More manual webhook setup required
   * Better for air-gapped or restricted environments
   * Ideal for custom or self-hosted Git servers

## Supported Git Providers

While we provide detailed integration guides for popular platforms, **Coolify works with any Git provider** that supports standard Git protocols:

* **Public Repositories**: Any Git provider (no authentication required)
* **With App Integration**: GitHub
* **With Deploy Keys**: Any Git provider (GitHub, GitLab, Bitbucket, Gitea, Gogs, Forgejo, self-hosted solutions, and more)

## Next Steps

Ready to connect your Git provider? Choose your platform for detailed setup guides:

* **[GitHub Integration](/applications/ci-cd/github/integration)** - Connect GitHub repositories
* **[GitLab Integration](/applications/ci-cd/gitlab/integration)** - Connect GitLab repositories
* **[Bitbucket Integration](/applications/ci-cd/bitbucket/integration)** - Connect Bitbucket repositories
* **[Gitea Integration](/applications/ci-cd/gitea/integration)** - Connect self-hosted Gitea
* **[Other Git Providers](/applications/ci-cd/other-providers)** - Connect Gogs, Forgejo, or any custom Git server

Or learn about [Build Packs](/applications/build-packs/overview) to understand how Coolify transforms your code into running containers.

---

---
url: /docs/services/classicpress.md
description: >-
  Run ClassicPress CMS on Coolify as WordPress alternative with classic editor,
  no blocks, and focus on business websites and traditional publishing.
---

![ClassicPress](https://raw.githubusercontent.com/ClassicPress/ClassicPress/develop/src/wp-admin/images/classicpress-logo.png)

## What is ClassicPress?

ClassicPress is a community-led open source content management system for creators. It is a fork of WordPress 6.2 that preserves the TinyMCE classic editor as the default option. It is half the size of WordPress, contains less bloat improving performance, and has no block editor (Gutenberg/Full Site Editing).

## Deployment Variants

ClassicPress is available in two deployment configurations in Coolify:

### ClassicPress with MariaDB

* **Database:** MariaDB
* **Use case:** Production deployments with MariaDB preference (recommended for most users)
* **Components:**
  * ClassicPress container
  * MariaDB container
  * Automatic database configuration and health checks

### ClassicPress with MySQL

* **Database:** MySQL
* **Use case:** Production deployments with MySQL preference
* **Components:**
  * ClassicPress container
  * MySQL container
  * Automatic database configuration and health checks

Both variants provide equivalent functionality - choose based on your database preference or existing infrastructure.

For more information, see:

* [The official website](https://www.classicpress.net?utm_source=coolify.io)
* [The ClassicPress documentation](https://docs.classicpress.net?utm_source=coolify.io)
* [The ClassicPress governance](https://www.classicpress.net/governance?utm_source=coolify.io)
* [Suggest features](https://github.com/ClassicPress/ClassicPress/issues?utm_source=coolify.io)

---

---
url: /docs/databases/clickhouse.md
description: >-
  Deploy ClickHouse on Coolify with column-oriented OLAP database, real-time
  analytics, S3 backups, and exceptional query performance.
---

# Clickhouse

## What is ClickHouse

ClickHouse is an open-source column-oriented database management system designed for online analytical processing (OLAP).

It's known for its exceptional query performance on large datasets, making it ideal for real-time analytics and data warehousing applications.

ClickHouse uses a column-oriented storage format and employs various optimizations like vectorized query execution to achieve high performance.

It supports SQL with extensions and can handle both batch and stream data ingestion, making it versatile for various analytical workloads.

## Backup and Restore Guide

Currently, Coolify does not support modifying ClickHouse configurations, which means certain native backup options (e.g., backing up to a local Disk or using `ALTER TABLE ... FREEZE PARTITION ...`) are not possible. Instead, the recommended approach is to use S3 for backups.

### How to Backup ClickHouse

To backup a table or an entire database, use the following SQL command:

* **Backup a Table:**

```sql
BACKUP TABLE <table_name> TO S3('<your_s3_endpoint_com>/<unique_folder_for_table_backup>', '<s3_access_key>', '<s3_secret_key>')
```

* **Backup a Database:**
  Replace `TABLE` with `DATABASE` to backup the whole database:

```sql
BACKUP DATABASE <database_name> TO S3('<your_s3_endpoint_com>/<unique_folder_for_database_backup>', '<s3_access_key>', '<s3_secret_key>')
```

### How to Restore ClickHouse

To restore a table or database from an S3 backup, use the corresponding RESTORE command:

* **Restore a Table:**

```sql
RESTORE TABLE <table_name> FROM S3('<your_s3_endpoint_com>/<unique_folder_from_table_backup>', '<s3_access_key>', '<s3_secret_key>')
```

* **Restore a Database:**
  Replace `TABLE` with `DATABASE` to restore the whole database:

```sql
RESTORE DATABASE <database_name> FROM S3('<your_s3_endpoint_com>/<unique_folder_from_database_backup>', '<s3_access_key>', '<s3_secret_key>')
```

### What Doesn't Work

* **Disk Backups:**

```sql
BACKUP TABLE test.table TO Disk('backups', '1.zip')
```

Does not work due to Coolify not allowing modifications to ClickHouse configurations.

* **Native Partition Freezes:**

```sql
ALTER TABLE ... FREEZE PARTITION ...
```

May not work because of limitations in the Docker/Coolify file structure.

* **clickhouse-backup Tool:**
  External tools like [clickhouse-backup](https://github.com/Altinity/clickhouse-backup?utm_source=coolify.io) might not function properly within the Docker/Coolify setup due to similar configuration restrictions.

### Performance Notes

A community member shared that backing up a 145GB database took around 12 minutes, while restoring it took roughly 17 minutes.

## Links

* [The official website](https://clickhouse.com/?utm_source=coolify.io)
* [GitHub](https://github.com/ClickHouse/ClickHouse?utm_source=coolify.io)

---

---
url: /docs/services/cloudbeaver.md
description: >-
  Deploy CloudBeaver on Coolify for web-based database management supporting
  PostgreSQL, MySQL, MongoDB with SQL editor and data visualization.
---

# Cloudbeaver

## What is Cloudbeaver

CloudBeaver is a lightweight web application designed for comprehensive data management.

## Links

* [Official Documentation](https://dbeaver.com/docs/cloudbeaver/?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/cloudflare/origin-cert.md
description: >-
  Secure Coolify deployments with 15-year Cloudflare Origin Certificates for TLS
  encryption without HTTP challenges or port 80 exposure requirements.
---

# Cloudflare Origin Certificate

The Cloudflare Origin Certificate ensures secure communication between your server and Cloudflare when using Cloudflareâ€™s Proxy, CDN, and security features.

It encrypts the data exchanged between your server and Cloudflare, keeping it safe.

### Why Use Cloudflare Origin Certificate with Coolify?

1. No need for HTTP or DNS challenges to create certificates.
2. Keep port 80 closed â€” everything happens securely over TLS.
3. Longer certificate validity (15 years) â€” once set up, you donâ€™t need to worry about renewing every few months.

### When to Avoid Using Cloudflare Origin Certificate

1. If you need a free certificate for subdomains with multiple levels (e.g., app.sub.domain.com).
2. The certificate is only trusted by Cloudflare, meaning if Cloudflare is down, nobody can access your apps and websites (via your domain).

***

::: info Example Data
The following data is used as an example in this guide. Please replace it with your actual data when following the steps:

* **IPv4 Address of Origin Server:** 203.0.113.1
* **Domain Name:** shadowarcanist.com
* **Username:** shadowarcanist
  :::

## 1. Create the Origin Certificate

To create your Cloudflare Origin Certificate, follow these steps:

1. In your Cloudflare dashboard, go to **SSL/TLS**.
2. Select **Origin Server**.
3. Click the **Create Certificate** button.

Youâ€™ll be asked to choose a private key type, hostnames, and certificate validity.

1. Choose **RSA (2048)** for the key type.
2. Add the hostnames you want the certificate to cover.

::: warning HEADS UP!

* **`shadowarcanist.com`** will cover only the main domain.
* **`*.shadowarcanist.com`** will cover all subdomains.

On Cloudflareâ€™s free plan, wildcard certificates cover just one level of subdomains

For example, it works for **`coolify.shadowarcanist.com`** but not **`www.coolify.shadowarcanist.com`**.

To cover multiple levels, you'll need to purchase the [Advanced Certificate Manager](https://www.cloudflare.com/application-services/products/advanced-certificate-manager/)
:::

3. Set the certificate validity to **15 years**.

Your certificate will now be generated.

1. Choose **PEM** as the key format.
2. Copy your **Certificate**.
3. Copy your **Private Key**.

Next, you'll add these to your server running Coolify and configure Coolify to use this certificate.

## 2. Add Certificate to Your Server

SSH into your server or use Coolify's terminal feature. For this guide, Iâ€™m using SSH:

```sh
ssh shadowarcanist@203.0.113.1
```

Once logged in, navigate to the Coolify proxy directory:

```sh
$ cd /data/coolify/proxy
```

Check if you have a **certs** folder:

```sh
$ ls
> acme.json  docker-compose.yml  dynamic
```

If thereâ€™s no **certs** folder, create it:

```sh
$ mkdir certs
```

Verify it was created:

```sh
$ ls
> acme.json  certs docker-compose.yml  dynamic
```

Now, navigate into the **certs** directory:

```sh
$ cd certs
```

Create two new files for the certificate and private key:

```sh
$ touch shadowarcanist.cert shadowarcanist.key
```

Verify the files were created:

```sh
$ ls
> shadowarcanist.cert shadowarcanist.key
```

Open the **shadowarcanist.cert** file and paste the certificate from the Cloudflare dashboard:

```sh
$ nano shadowarcanist.cert
```

Save and exit after pasting the certificate.

Do the same for the **shadowarcanist.key** file and paste the private key:

```sh
$ nano shadowarcanist.key
```

Save and exit.

Now the origin certificate is installed on your server.

## 3. Set Up DNS Records and TLS Encryption

To make the origin certificate work, configure your DNS records, enable TLS, and set up HTTP to HTTPS redirects in Cloudflare:

1. In Cloudflare, go to **DNS**.
2. Select **Records**.
3. Add 2 A records:
4. Enter name as **`shadowarcanist.com`** and `*`
5. Use the **IP address** of your server as the content for both records.
6. Set the proxy status to **Proxied** for better security.

Next, set up TLS encryption:

1. Go to **SSL/TLS** in Cloudflare.
2. Select **Overview**.
3. Click **Configure** button

Choose **Full (Strict)** as the encryption mode.

Finally, enable HTTP to HTTPS redirects:

1. In Cloudflare, go to **SSL/TLS**
2. Select **Edge Certificates**.
3. Enable **Always Use HTTPS**.

## 4. Configure Coolify to Use the Origin Certificate

Now, in your Coolify dashboard:

1. Go to the **Server** section in the sidebar.
2. Select **Proxy**.
3. Open the **Dynamic Configuration** page
4. Click **Add** button

You will now be prompted to enter the Dynamic Configuration.

1. Choose a name for your configuration.
2. Enter the following details in the configuration field:

```sh
tls:
  certificates:
    -
      certFile: /traefik/certs/shadowarcanist.cert
      keyFile: /traefik/certs/shadowarcanist.key
```

Adding Multiple Certificates (click to view)

```sh
tls:
  certificates:
    -
      certFile: /traefik/certs/shadowarcanist.cert
      keyFile: /traefik/certs/shadowarcanist.key
    -
      certFile: /traefik/certs/name2.cert
      keyFile: /traefik/certs/name2.key
    -
      certFile: /traefik/certs/name3.cert
      keyFile: /traefik/certs/name3.key
```

3. Save the configuration

From now on, Coolify will use the origin certificate for requests matching the hostname.

::: danger HEADS UP!
**All the steps below are optional. Coolify should already be using the origin certificate. Follow these steps only if you know what you're doing and want to simplify the configuration**
:::

## 5. Optional: Configure Traefik

This step is optional but recommended for cleaning up unnecessary settings while self-hosting.

Since youâ€™re using an Origin Certificate, you no longer need HTTP challenges or port 80 open.

1. Go **Server** in the Coolify dashboard.
2. Select **Proxy**.
3. Open **Configuration**.
4. Replace the configuration with this:

```sh
# Define external networks
networks:
  coolify:
    external: true  # External network.

services:
  # Traefik reverse proxy
  traefik:
    container_name: coolify-proxy  # Container name.
    image: 'traefik:v3.1'  # Traefik image version.
    restart: unless-stopped  # Auto-restart policy.
    extra_hosts:
      - 'host.docker.internal:host-gateway'  # Host communication.
    networks:
      - coolify  # Network connection.
    ports:
      - '443:443'  # Expose HTTPS port.
    healthcheck:  # Health check configuration.
      test: 'wget -qO- http://localhost:80/ping || exit 1'  # Ping endpoint for health check.
      interval: 4s  # Health check interval.
      timeout: 2s  # Health check timeout.
      retries: 5  # Retry attempts.
    volumes:
      - '/var/run/docker.sock:/var/run/docker.sock:ro'  # Docker socket access.
      - '/data/coolify/proxy:/traefik'  # Traefik config volume.
    command:
      # Traefik configuration options
      - '--ping=true'  # Enable ping for health check.
      - '--ping.entrypoint=http'  # Use HTTP entrypoint for ping.
      - '--entrypoints.http.address=:80'  # HTTP entry point for health checks.
      - '--entrypoints.https.address=:443'  # HTTPS entry point.
      - '--entrypoints.http.http.encodequerysemicolons=true'  # Enable query semicolon encoding.
      - '--entryPoints.http.http2.maxConcurrentStreams=50'  # HTTP/2 max streams.
      - '--entrypoints.https.http.encodequerysemicolons=true'  # Enable HTTPS query encoding.
      - '--entryPoints.https.http2.maxConcurrentStreams=50'  # HTTPS/2 max streams.
      - '--entrypoints.https.http3'  # Enable HTTP/3.
      - '--providers.docker.exposedbydefault=false'  # Disable default exposure.
      - '--providers.file.directory=/traefik/dynamic/'  # Dynamic config directory.
      - '--certificatesresolvers.letsencrypt.acme.httpchallenge=false'  # Disable HTTP challenge for Let's Encrypt.
      - '--providers.file.watch=true'  # Enable config file watching.
      - '--providers.docker=true'  # Enable Docker provider.
    labels:
      - coolify.managed=true  # Managed by Coolify.
      - coolify.proxy=true  # Proxy service.
```

::: info Note
The comments in this configuration explain each line. You can remove the comments when copying it into your configuration.
:::

Next, you'll need to remove a few labels from your Dockerfile-based deployments. Below is an **example** of how I set this up for my website.

1. Go to **Projects** and select your project.
2. Open **Configuration**
3. Go to **General**
4. Check **Readonly labels** option
5. Replace the labels with the following:

```sh
# Enable Traefik for this configuration
traefik.enable=true

# Define the entry point for the router (HTTPS)
traefik.http.routers.shadowarcanist.entryPoints=https

# Set the routing rule for this router to match the domain "shadowarcanist.com" and any path starting with "/"
traefik.http.routers.shadowarcanist.rule=Host(`shadowarcanist.com`) && PathPrefix(`/`)

# Assign the service 'shadowarcanist' to this router
traefik.http.routers.shadowarcanist.service=shadowarcanist

# Enable TLS (HTTPS) for this router
traefik.http.routers.shadowarcanist.tls=true

# Specify the backend service and its port (port 80)
traefik.http.services.shadowarcanist.loadbalancer.server.port=80
```

Now youâ€™re done! Your server is set up to use the Cloudflare Origin Certificate, and all traffic is secured via TLS.

***

::: warning Note
Keep in mind that the above labels are provided as an example. These may or may not work for your specific use case, so use them as a reference.
:::

## Credits

The header image is designed using icons from [Flaticon](https://www.flaticon.com/).
Links to each icon can be found below:

* [Medal icon](https://www.flaticon.com/free-icon/medal_14468558) by [Vlad Szirka](https://www.flaticon.com/authors/vlad-szirka)
* [Award icon](https://www.flaticon.com/free-icon/award_15218157) by [explanaicon](https://www.flaticon.com/authors/explanaicon)
* [Worldwide icon](https://www.flaticon.com/free-icon/worldwide_870169) by [Freepik](https://www.flaticon.com/authors/freepik)
* [Lock icon](https://www.flaticon.com/free-icon/lock_2089784) by [Those Icons](https://www.flaticon.com/authors/those-icons)
* [Browser icon](https://www.flaticon.com/free-icon/browser_331190) by [Alfredo Hernandez](https://www.flaticon.com/authors/alfredo-hernandez)
* [Database icon](https://www.flaticon.com/free-icon/database_8028666) by [Tanah Basah](https://www.flaticon.com/authors/tanah-basah)

---

---
url: /docs/knowledge-base/s3/r2.md
description: >-
  Configure Cloudflare R2 S3-compatible storage for Coolify backups with bucket
  creation, API token setup, and access credentials configuration.
---

# Cloudflare R2

Cloudflare R2 is an S3 compatible storage. You can use it with Coolify to store your backups.

# Configuration

1. You need to create a bucket first in the Cloudflare R2 dashboard.
2. Then you need to create a R2 API token with `Object Read & Write` permission.
3. You can find the S3 client credentials when the token is created.
   ::: success Tip
   You will need the `Access Key ID`, `Secret Access Key` and the `S3 endpoint` from this view. Save them.
   :::
4. You can use the details from the previous step to configure Coolify.

---

---
url: /docs/knowledge-base/cloudflare/tunnels/overview.md
description: >-
  Connect Coolify resources securely without port forwarding using Cloudflare
  Tunnels for all resources, single apps, SSH access, or full HTTPS setups.
---

# Cloudflare Tunnels

[Cloudflare Tunnels](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) allow you to securely expose your local server or applications to the internet without opening ports on your router.

This makes them a great option for hosting projects on devices like old laptops or Raspberry Pis.

## Why Use Cloudflare Tunnels?

* No need to open or forward ports on your device to the public internet.
* Simplifies routing and DNS configuration.
* Supports exposing a single application or multiple services.
* Hides your server's IP address by routing traffic through a Cloudflare Tunnel, showing only your domain.
* Works even if you have a dynamic IP (or) no public IP at all.
* Eliminates the hassle of managing and setting up SSL certificates.

## When Not to Use Cloudflare Tunnels?

* If you prefer direct access to your server without a proxy layer.
* If you're concerned about routing traffic through Cloudflare's servers.
* If you rely on additional firewall tools, as Cloudflare Tunnels bypass all firewall rules.
* If you need SSL certificates trusted by entities other than Cloudflare.

## Ways to Use Cloudflare Tunnels with Coolify

You can set up Cloudflare Tunnels with Coolify in several ways, depending on your needs. Below are the available options, each linked to a detailed guide for easy setup:

1. [All Resources](/knowledge-base/cloudflare/tunnels/all-resource) -> Use a tunnel for all resources deployed through Coolify. This is the **easiest** and **most recommended** way for beginners.

2. [Single Resource](/knowledge-base/cloudflare/tunnels/single-resource) -> Use a tunnel for a single resource deployed through Coolify.

3. [Server SSH Access](/knowledge-base/cloudflare/tunnels/server-ssh) -> Securely connect your server to Coolify using a domain through Cloudflare Tunnel.

4. [Full HTTPS/TLS](/knowledge-base/cloudflare/tunnels/full-tls) -> Setup always-on **HTTPS** for all domains and subdomains. Normally, Coolify uses **HTTP** while Cloudflare manages **HTTPS**. If certain apps require **HTTPS** directly on Coolify.

::: success Tip:
Itâ€™s highly recommended to go with the first option [All Resources](/knowledge-base/cloudflare/tunnels/all-resource) if you're new to Coolify and Cloudflare Tunnels, as itâ€™s much easier to set up and manage.
:::

---

---
url: /docs/services/cloudflared.md
description: >-
  Run Cloudflare Tunnel on Coolify to expose local services securely without
  port forwarding using cloudflared for remote access and protection.
---

![Cloudflare](https://avatars.githubusercontent.com/u/314135?s=200\&v=4)

## What is Cloudflared?

Cloudflare Tunnel is tunneling software that lets you quickly secure and encrypt application traffic to any type of infrastructure, so you can hide your web server IP addresses, block direct attacks, and get back to delivering great applications.

## Links

* [The official website](https://www.cloudflare.com/products/tunnel?utm_source=coolify.io)
* [GitHub](https://github.com/cloudflare/cloudflared?utm_source=coolify.io)

---

---
url: /docs/services/cockpit.md
description: >-
  Host Cockpit CMS on Coolify for headless content management with flexible data
  structures, REST API, GraphQL, and developer-friendly workflows.
---

# Cockpit

## What is Cockpit

Cockpit is a headless content platform that is lightweight, fast and ready for takeoff.

## Links

* [Official Documentation](https://getcockpit.com/documentation/?utm_source=coolify.io)

---

---
url: /docs/services/code-server.md
description: >-
  Run VS Code in browser on Coolify with code-server for remote development,
  extensions support, terminal access, and cloud-based coding environment.
---

# Code Server

![Code Server1](https://github.com/coder/code-server/raw/main/docs/assets/screenshot-1.png)
![Code Server2](https://github.com/coder/code-server/raw/main/docs/assets/screenshot-2.png)

## What is Code Server?

Run [VS Code](https://github.com/Microsoft/vscode) on any machine anywhere and access it in the browser.

## Highlights

* Code on any device with a consistent development environment
* Use cloud servers to speed up tests, compilations, downloads, and more
* Preserve battery life when you're on the go; all intensive tasks run on your server

## Requirements

See [requirements](https://coder.com/docs/code-server/latest/requirements?utm_source=coolify.io) for minimum specs

**TL;DR:** Linux machine with WebSockets enabled, 1 GB RAM, and 2 vCPUs

## Questions?

See answers to [frequently asked questions](https://coder.com/docs/code-server/latest/FAQ?utm_source=coolify.io).

## Links

* [The official website](https://coder.com/docs/code-server/?utm_source=coolify.io)
* [GitHub](https://github.com/coder/code-server?utm_source=coolify.io)

---

---
url: /docs/services/codimd.md
description: >-
  Deploy CodiMD collaborative markdown editor on Coolify with real-time
  collaboration, presentations, diagrams, and knowledge sharing for teams.
---

## What is CodiMD?

CodiMD lets you collaborate in real-time with markdown. Built on HackMD source code, CodiMD lets you host and control your team's content with speed and ease.

## Screenshots

## Links

* [The official website](https://hackmd.io/c/codimd-documentation/%2Fs%2Fcodimd-documentation?utm_source=coolify.io)
* [GitHub](https://github.com/hackmdio/codimd?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/commands.md
description: >-
  Essential Coolify CLI commands for root password reset, email changes, and
  deleting stuck services via Docker exec and Artisan commands.
---

# Commands

## Root password reset without SMTP

You can use the following method to reset the root user's password, in case you forgot and do not have an SMTP server set, so you cannot request a forgot password.

Login to your server through SSH and execute the following command:

```bash
docker exec -ti coolify sh -c "php artisan root:reset-password"
```

## Root email change

You can change root user's email.

Login to your server through SSH and execute the following command:

```bash
docker exec -ti coolify sh -c "php artisan root:change-email"
```

## Delete a stuck service

You can easily delete a stucked service.

Login to your server through SSH and execute the following command:

```bash
docker exec -ti coolify sh -c "php artisan services:delete"
```

---

---
url: /docs/troubleshoot/server/connection-issues.md
description: >-
  Fix unstable Coolify server connections by removing UFW LIMIT rules, adjusting
  iptables, and configuring firewall settings for port 22 SSH access.
---

# Connection Unstable

If you're experiencing unstable connections, most of the times (90% of the cases) a firewall issue, ufw, iptables or some configuration on your server or between your Coolify instance (or Coolify Cloud) and your server.

## Symptoms

* Server is sometimes reachable, sometimes not.
* You receive a lot of failed connection lost emails.

## Diagnosis

* Check your UFW rules with `ufw status numbered` and see if you have a `LIMIT` rule for port 22.
* Check your iptables rules with `iptables -L -v -n` and see if you have a `LIMIT` rule for port 22.
* Check your server logs (`/var/log/ufw.log`, `/var/log/iptables.log`, `/var/log/auth.log`, `/var/log/kern.log`) for any firewall related errors.

## Solution

* UFW

  * `ufw status numbered` - if you have port 22 open, but with a `LIMIT` rule, this is the problem.
  * `ufw delete <rule_number>` - delete the rule - you probably have IPV4 and IPV6 rules, so you need to delete both.
    * After you deleted the rule, you need to check the status with `ufw status numbered` and see that the rule is deleted and which rule number is next.
  * `ufw allow 22/tcp` - add the rule without a limit.

  OR

  * `ufw limit 22/tcp 100/minute` - add a higher limit.

In case of Coolify Cloud, you can enable connection from Coolify Cloud IP addresses by adding the following to the UFW rules:

```sh
 ufw insert 1 allow from <ipv4>/22 to any port 22
 ufw insert 2 allow from <ipv6>/22 to any port 22
```

> You can find the IP addresses in the Coolify Cloud here: https://coolify.io/ipv4.txt and https://coolify.io/ipv6.txt

---

---
url: /docs/get-started/contribute/documentation.md
description: >-
  Contribute to Coolify docs with this guide covering repository setup, local
  development with Bun, image guidelines, and pull request workflow.
---

# Coolify Docs Contribution Guide

This guide outlines the process for contributing updates and fixes to our docs. Please follow the steps below to ensure a smooth and efficient workflow.

## 1. Repository Workflow

* **Release Process:**\
  We follow a weekly production release cycle. The **main** branch represents production, while the **next** branch is used as our development branch.

* **Branching Guidelines:**
  * **Do not create pull requests (PRs) to the main branch.**
  * All contributions should be made to the **next** branch.
  * **Clone the repository from the next branch** to your GitHub account, then start working on your changes.

## 2. Getting Started

### Step 1: Fork and Clone the Repository

* First fork the docs repository to your github account, then clone your fork to your local system using:
  ```sh
  git clone https://github.com/your-username/your-repo-name.git
  ```
* Navigate to the cloned repository:
  ```sh
  cd your-repo-name
  ```

### Step 2: Install Dependencies and Run the Dev Server

We use [bun](https://bun.sh/) as our preferred package manager for local development. If you choose to use a different package manager, please **do not include its configuration files** in your commit.

To set up your environment, run:

```bash
bun install && bun run dev
```

The development server will start on `localhost` at port `5173`. You can view the documentation by navigating to:

```bash
http://localhost:5173/docs/
```

## 3. Image Guidelines

* **Format:**\
  All images used in the documentation must be in `.webp` format.

* **Location:**\
  Place all image files in the `/docs/public` directory.

* **Usage:**\
  Use the Zoomable image component on the docs to attach your images
  ```vue
  <ZoomableImage src="path-to-the-image.webp" alt="Path To The Image" />
  ```

## 4. Writing and Structuring Content

### Best Practices for Documentation:

* **Clear and Simple Language:**\
  Use plain and easily understandable English. Remember that not all readers are native English speakers.

* **Beginner-Friendly Guides:**\
  Break down instructions into small, easy-to-follow steps. Include screenshots wherever possible to help visualize the process, especially for users new to self-hosting or Coolify.

* **Content Organization:**\
  Structure your content with clear headings, bullet points, and numbered steps where applicable. This makes it easier for readers to follow along.

## 5. Submitting Your Contribution

1. **Commit your changes to your repository**

2. **Create a Pull Request:**
   * Open a pull request (PR) to merge your changes into the **next** branch on the docs repository.
   * Provide a detailed description of your updates to help maintainers review your contribution effectively.

## 6. Questions and Support

If you have any questions or run into issues while contributing:

* **Create an Issue:** Open an issue on the repository detailing your issue.
* **Discord:** Reach out to us on contribute channel on the [Coolify Discord community](https://coolify.io/discord).

## 7. Important Notes

* **Documentation Updates:**\
  The current docs are bit outdated and missing some information. The docs maintainers are actively rewriting parts of the documentation to improve structure and clarity before new content is added.

* **PR Approval:**\
  Merging of your PR is subject to review by the maintainers. Please be patient as they work through the process.

We appreciate your contribution and effort in making the Coolify docs better for everyone.

---

---
url: /docs/get-started/contribute/coolify.md
description: >-
  Contribute to Coolify open-source development with step-by-step setup guide,
  Docker environment, Spin commands, and pull request workflow.
---

# Contributing to Coolify

> "First, thanks for considering contributing to my project. It really means a lot!" - [@andrasbacsai](https://github.com/andrasbacsai)

You can ask for guidance anytime on our [Discord Community Server](https://coollabs.io/discord) in the `#contribute` channel.

To understand the tech stack, please refer to the [Tech Stack](https://github.com/coollabsio/coolify/blob/main/TECH_STACK.md) document.

## Table of Contents

1. [Setup Development Environment](#_1-setup-development-environment)
2. [Verify Installation](#_2-verify-installation-optional)
3. [Fork and Setup Local Repository](#_3-fork-and-setup-local-repository)
4. [Set up Environment Variables](#_4-set-up-environment-variables)
5. [Start Coolify](#_5-start-coolify)
6. [Start Development](#_6-start-development)
7. [Create a Pull Request](#_7-create-a-pull-request)
8. [Development Notes](#development-notes)
9. [Resetting Development Environment](#resetting-development-environment)
10. [Additional Contribution Guidelines](#additional-contribution-guidelines)

## 1. Setup Development Environment

Follow the steps below for your operating system:

1. Install `docker-ce`, Docker Desktop (or similar):
   * Docker CE (recommended):
     * Install Windows Subsystem for Linux v2 (WSL2) by following this guide: [Install WSL](https://learn.microsoft.com/en-us/windows/wsl/install?ref=coolify)
     * After installing WSL2, install Docker CE for your Linux distribution by following this guide: [Install Docker Engine](https://docs.docker.com/engine/install/?ref=coolify)
     * Make sure to choose the appropriate Linux distribution (e.g., Ubuntu) when following the Docker installation guide
   * Install Docker Desktop (easier):
     * Download and install [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/?ref=coolify)
     * Ensure WSL2 backend is enabled in Docker Desktop settings

2. Install Spin:
   * Follow the instructions to install Spin on Windows from the [Spin documentation](https://serversideup.net/open-source/spin/docs/installation/install-windows#download-and-install-spin-into-wsl2?ref=coolify)

1) Install Orbstack, Docker Desktop (or similar):
   * Orbstack (recommended, as it is a faster and lighter alternative to Docker Desktop):
     * Download and install [Orbstack](https://docs.orbstack.dev/quick-start#installation?ref=coolify)
   * Docker Desktop:
     * Download and install [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/?ref=coolify)

2) Install Spin:
   * Follow the instructions to install Spin on MacOS from the [Spin documentation](https://serversideup.net/open-source/spin/docs/installation/install-macos/#download-and-install-spin?ref=coolify)

1. Install Docker Engine, Docker Desktop (or similar):
   * Docker Engine (recommended, as there is no VM overhead):
     * Follow the official [Docker Engine installation guide](https://docs.docker.com/engine/install/?ref=coolify) for your Linux distribution
   * Docker Desktop:
     * If you want a GUI, you can use [Docker Desktop for Linux](https://docs.docker.com/desktop/install/linux-install/?ref=coolify)

2. Install Spin:
   * Follow the instructions to install Spin on Linux from the [Spin documentation](https://serversideup.net/open-source/spin/docs/installation/install-linux#configure-docker-permissions?ref=coolify)

## 2. Verify Installation (Optional)

After installing Docker (or Orbstack) and Spin, verify the installation:

1. Open a terminal or command prompt
2. Run the following commands:
   ```bash
   docker --version
   spin --version
   ```
   You should see version information for both Docker and Spin.

## 3. Fork and Setup Local Repository

1. Fork the [Coolify](https://github.com/coollabsio/coolify) repository to your GitHub account.

2. Install a code editor on your machine (choose one):

   | Editor | Platform | Download Link |
   |--------|----------|---------------|
   | Visual Studio Code (recommended free) | Windows/macOS/Linux | [Download](https://code.visualstudio.com/download?ref=coolify) |
   | Cursor (recommended but paid) | Windows/macOS/Linux | [Download](https://www.cursor.com/?ref=coolify) |
   | Zed (very fast) | macOS/Linux | [Download](https://zed.dev/download?ref=coolify) |

3. Clone the Coolify Repository from your fork to your local machine
   * Use `git clone` in the command line, or
   * Use GitHub Desktop (recommended):
     * Download and install from [https://desktop.github.com/](https://desktop.github.com/?ref=coolify)
     * Open GitHub Desktop and login with your GitHub account
     * Click on `File` -> `Clone Repository` select `github.com` as the repository location, then select your forked Coolify repository, choose the local path and then click `Clone`

4. Open the cloned Coolify Repository in your chosen code editor.

## 4. Set up Environment Variables

1. In the Code Editor, locate the `.env.development.example` file in the root directory of your local Coolify repository.
2. Duplicate the `.env.development.example` file and rename the copy to `.env`.
3. Open the new `.env` file and review its contents. Adjust any environment variables as needed for your development setup.
4. If you encounter errors during database migrations, update the database connection settings in your `.env` file. Use the IP address or hostname of your PostgreSQL database container. You can find this information by running `docker ps` after executing `spin up`.
5. Save the changes to your `.env` file.

## 5. Start Coolify

1. Open a terminal in the local Coolify directory.
2. Run the following command in the terminal (leave that terminal open):
   ```bash
   spin up
   ```

::: warning Note:
You may see some errors, but don't worry this is expected.
:::

3. If you encounter permission errors, especially on macOS, use:
   ```bash
   sudo spin up
   ```

::: warning Note:
If you change environment variables afterwards or anything seems broken, press Ctrl + C to stop the process and run `spin up` again.
:::

## 6. Start Development

1. Access your Coolify instance:
   * URL: `http://localhost:8000`
   * Login: `test@example.com`
   * Password: `password`

2. Additional development tools:

| Tool | URL | Note |
|------|-----|------|
| Laravel Horizon (scheduler) | `http://localhost:8000/horizon` | Only accessible when logged in as root user |
| Mailpit (email catcher) | `http://localhost:8025` | |
| Telescope (debugging tool) | `http://localhost:8000/telescope` | Disabled by default |

::: info Tip:
To enable Telescope, add the following to your `.env` file:

```yaml
TELESCOPE_ENABLED=true
```

:::

## 7. Create a Pull Request

1. After making changes or adding a new service:
   * Commit your changes to your forked repository.
   * Push the changes to your GitHub account.

2. Creating the Pull Request (PR):
   * Navigate to the main Coolify repository on GitHub.
   * Click the "Pull requests" tab.
   * Click the green "New pull request" button.
   * Choose your fork and branch as the compare branch.
   * Click "Create pull request".

3. Filling out the PR details:
   * Give your PR a descriptive title.
   * Use the Pull Request Template provided and fill in the details.

::: danger IMPORTANT
Always set the base branch for your PR to the `next` branch of the Coolify repository, not the `main` branch.
:::

4. Submit your PR:
   * Review your changes one last time.
   * Click "Create pull request" to submit.

::: warning Note:
Make sure your PR is out of draft mode as soon as it's ready for review. PRs that are in draft mode for a long time may be closed by maintainers.
:::

After submission, maintainers will review your PR and may request changes or provide feedback.

## Development Notes

When working on Coolify, keep the following in mind:

1. **Database Migrations**: After switching branches or making changes to the database structure, always run migrations:

```bash
docker exec -it coolify php artisan migrate
```

2. **Resetting Development Setup**: To reset your development setup to a clean database with default values:

```bash
docker exec -it coolify php artisan migrate:fresh --seed
```

3. **Troubleshooting**: If you encounter unexpected behavior, ensure your database is up-to-date with the latest migrations and if possible reset the development setup to eliminate any environment-specific issues.

::: danger IMPORTANT:
Forgetting to migrate the database can cause problems, so make it a habit to run migrations after pulling changes or switching branches.
:::

## Resetting Development Environment

If you encounter issues or break your database or something else, follow these steps to start from a clean slate (works since `v4.0.0-beta.342`):

1. Stop all running containers `ctrl + c`.

2. Remove all Coolify containers:

```bash
docker rm coolify coolify-db coolify-redis coolify-realtime coolify-testing-host coolify-minio coolify-vite-1 coolify-mail
```

3. Remove Coolify volumes (it is possible that the volumes have no `coolify` prefix on your machine, in that case remove the prefix from the command):

```bash
docker volume rm coolify_dev_backups_data coolify_dev_postgres_data coolify_dev_redis_data coolify_dev_coolify_data coolify_dev_minio_data
```

4. Remove unused images:

```bash
docker image prune -a
```

5. Start Coolify again:

```bash
spin up
```

6. Run database migrations and seeders:

```bash
docker exec -it coolify php artisan migrate:fresh --seed
```

After completing these steps, you'll have a fresh development setup.

::: danger IMPORTANT
Always run database migrations and seeders after switching branches or pulling updates to ensure your local database structure matches the current codebase and includes necessary seed data.
:::

## Additional Contribution Guidelines

### Contributing a New Service

To add a new service to Coolify, please refer to our documentation: [Adding a New Service](/get-started/contribute/service)

### Contributing to Documentation

To contribute to the Coolify documentation, please refer to this guide: [Contributing to the Coolify Documentation](/get-started/contribute/documentation)

---

---
url: /docs/services/convertx.md
description: >-
  Host ConvertX file conversion on Coolify for format transformation, document
  processing, image optimization, and media file conversion services.
---

# Convertx

## What is Convertx

A self-hosted online file converter. Supports over a thousand different formats.

## Links

* [Official Documentation](https://github.com/C4illin/ConvertX?utm_source=coolify.io)

---

---
url: /docs/services/convex.md
description: >-
  Deploy Convex backend on Coolify with reactive database, serverless functions,
  real-time sync, and TypeScript-first development for modern apps.
---

# Convex

## What is Convex

Convex is the open-source reactive database for app developers.

## How to Generate an Admin Key

To generate an admin key for your Convex application in Coolify, follow these steps:

1. Go to the Coolify dashboard.
2. Select your Convex application.
3. Open the Terminal tab.
4. Connect to the backend terminal.
5. In the terminal, execute the following command: `./generate_admin_key.sh`
6. Copy the generated admin key for your records.

## Links

* [Official Documentation](https://docs.convex.dev/?utm_source=coolify.io)

---

---
url: /docs/get-started/cloud.md
description: >-
  Coolify Cloud is a fully managed PaaS service with zero maintenance, automatic
  scaling, daily backups, and email notifications.
---

[Coolify Cloud](https://coolify.io/pricing/) is our managed, paid service (maintained by [Andras](https://x.com/heyandras), Coolifyâ€™s Founder) that runs the Coolify on our infrastructure, so you donâ€™t need to allocate CPU, RAM, or disk for Coolify itself.

You still bring your own servers (VPS, Raspberry Pi, EC2, etc.) and connect them via SSH, then deploy apps, databases, and services exactly as you would with a self-hosted instance.

Coolify Cloud uses the same open-source codebase, so there are no locked-behind-paywall features.

## Benefits of Coolify Cloud

| Features                     | Explanation                                                                                                         |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| **Zero Maintenance Coolify** | No need to upgrade, or monitor Coolify, our team does it for you.                                                   |
| **Daily Backups**            | The Coolify Cloud database is backed up every 24 hours.                                                             |
| **Preconfigured Email**      | Receive build, deployment, and server status notifications via email without any setup on your end.                 |
| **Automatic Scaling**        | As you connect more servers, our infrastructure scales CPU, RAM, and disk usage for Coolify.                        |
| **Staged Updates**           | New updates are first rolled out to self-hosted users. Once stability is confirmed, theyâ€™re rolled out to Cloud.    |
| **Founder-Tested Releases**  | Andras personally tests every update before itâ€™s deployed to the Cloud, ensuring maximum stability and reliability. |

## Getting Started with Coolify Cloud

1. **Create Your Account:**

   * Visit the [Coolify Cloud Registration](https://app.coolify.io/register) page and sign up.

2. **Choose Your Plan:**

   * Base fee: **$5/month** (includes up to two connected servers).
   * **$3/month** per additional server.

3. **Complete Payment**

   * Use any major credit/debit card to finish the subscription process.

4. **Connect Your Servers**

   * ::: details Detailed Server Connection Guide
     1. **Add Private Key:** Login to your Coolify account (or create one if youâ€™re new) and Add a new private key



     ***
     2. **Add a Server:** Navigate to the **Servers** tab and add a new server by entering your Hetzner serverâ€™s IPv4 address.



     ***
     3. **Validate Server:** Click **Validate Server & Install Docker Engine**. Coolify will automatically install all necessary components on your server.

     ***
     4. **Check Status:** Once finished, you should see a green **Proxy Running** status indicating everything is set up.

        :::

5. **Deploy Your Applications**

## How Coolify Cloud Pricing works?

We charge a base fee of **$5/month**, which covers up to **two servers**. Each additional server you connect is an **add-on of $3/month**.

Charging per server allows us to scale our infrastructure responsibly, since each connected server increases resource usage (CPU, RAM, storage) on our end.

If you only need one server, you still pay the $5 base fee (with capacity for a second server if you add it later).

If you plan to connect more than two, simply multiply $3 by the extra servers.

## Why Coolify Cloud Exists

You might wonder why Coolify Cloud is a paid service when there are no exclusive, locked-down features.

The idea came to Andras (Coolify's Founder) as a way to offer a â€œ**paid option without paywall**â€ â€” a model where the open-source project stays completely free, but those who prefer a managed experience can contribute financially.

* **Experiment Turned Success:**
  * Initially launched as an experiment, Coolify Cloud quickly attracted over 2,100 active users.

- **Sustainable Funding:**

  * While the revenue from Cloud is modest, it provides a steady income stream that helps keep Coolify free and under active development for everyone.

- **Community-First Approach**
  * By not restricting any features, we maintain transparency and trust.
  * Cloud subscribers simply pay for convenience and reliability, not to unlock core functionality.

## Frequently Asked Questions

::: details 1. Do I get any Cloud-only features?
No. Coolify Cloud and self-hosted Coolify share the same feature set.

Cloudâ€™s value lies in automatic backups, email notifications, scaling, and update testing handled for you.
:::
::: details 2. Does Coolify Cloud back up my application data?
No, Coolify Cloud only backs up the Coolify database (e.g., dashboard settings).

You are responsible for backing up any databases or storage volumes on your servers.
:::
::: details 3. Can I import my self-hosted Coolify configurations to Coolify Cloud?
No.

To transfer configurations, you'll need to back up the database from your self-hosted instance and restore it to a new Coolify instance.

However, since you donâ€™t have access to the database in Coolify Cloud, itâ€™s not possible to migrate data or settings directly to the cloud version.
:::
::: details 4. How often Coolify Cloud is backed up?
Every 24 hours
:::
::: details 5. Is Coolify Cloud really based on the open-source version of Coolify?
Yes, Coolify Cloud uses the same open-source codebase as the self-hosted version. There are no paywall features, and the Cloud service is simply a managed experience for convenience.
:::
::: details 6. What happens if I cancel my Coolify Cloud subscription?
If you cancel your subscription, you will stop being billed, and your access to Coolify Cloud will be suspended at the end of your current billing cycle.

However, your servers will remain unaffected, and all of your applications will continue running as normal.

Since your server will still be hosting your applications with a reverse proxy handling incoming requests, there will be no interruptions.
:::
::: details 7. What happens if I forget to pay an invoice?
If a payment fails or an invoice is missed, your subscription and access to Coolify Cloud will be temporarily paused until the payment is successfully processed.

You will receive an email notification about the failed payment.

Once the payment is made, your Coolify Cloud access will be restored, and all your settings will remain intactâ€”thereâ€™s no data loss.

Your servers will also stay up and running, and your applications will continue to function normally, as everything is still hosted on your own server with a reverse proxy.
:::

::: details 8. Are there any IP addresses I need to whitelist for Coolify Cloud?
Yes, Coolify Cloud uses specific IP addresses.

You can find the list of IPs [here](https://coolify.io/docs/knowledge-base/faq#coolify-cloud-public-ips).

The main requirement is that Coolify Cloud needs to access your server's SSH port.
:::
::: details 9. Do I need to bring my own servers to Coolify Cloud?
Yes, when using Coolify Cloud, you must provide your own servers (e.g., VPS, Raspberry Pi, EC2, etc.).

Coolify Cloud manages Coolify on our infrastructure, but we donâ€™t provide the servers themselves.

This approach allows you to choose the hardware that best fits your needs.
:::
::: details 10. Why do I have to pay for Coolify Cloud if Iâ€™m bringing my own servers?
While you bring your own servers, the subscription fee for Coolify Cloud covers the managed service aspect.

This includes infrastructure management, maintenance, support, updates, and scaling, so you donâ€™t have to worry about technical aspects like monitoring, patching, or backups for Coolify.

We take care of the heavy lifting to ensure everything runs smoothly.
:::
::: details 11. What happens if I exceed the number of connected servers?
You wonâ€™t be able to add extra servers to Coolify cloud unless your subscription is upgraded.
:::
::: details 12. Is there a trial period for Coolify Cloud?
Currently, Coolify Cloud doesnâ€™t offer a free trial. However, the subscription is affordableâ€”just **$5 per month** for up to two connected servers.

If you want to explore all the features, you can run Coolify on a small Linux server or a VM on your PC by following the [self-hosted installation guide](https://coolify.io/docs/get-started/installation).

Since both cloud and self-hosted versions use the same codebase, youâ€™ll be able to test all the features without any limitations.
:::
::: details 13. Can I get any discounts?
The current **$5/month** subscription rate is already quite affordable, so discounts are not available at the moment.
:::
::: details 14. I have to pay to use Coolify Cloud, so doesn't that mean I'm locked into a vendor?
**Not really.**

You're paying for the managed Coolify instance, but stopping the use of Coolify Cloud won't affect your applications.

You can connect your own server, so you retain full control. Everything runs as a Docker container, and Coolify will install a reverse proxy on your server to ensure everything works smoothly without needing Coolify Cloud.

In a true vendor lock-in, your apps would stop if you stop paying, but thatâ€™s not the case with Coolify Cloud.
:::
::: details 15. Can I access the Coolify Cloud dashboard on my own domain?
No.

The Coolify Cloud dashboard is only available at https://app.coolify.io.

If youâ€™d like to access the dashboard on your own domain, youâ€™ll need to self-host Coolify.
:::

---

---
url: /docs/get-started/concepts.md
description: >-
  Learn core Coolify concepts including servers, resources, environments,
  projects, Docker containers, reverse proxy, and team management basics.
---

Many people start their self-hosting journey after discovering Coolify. If youâ€™re one of them, hereâ€™s a list of a few concepts that could make your experience smoother.

## Servers

A server is a computer designed to run applications or services, providing the necessary computing power for your projects.

It can be either physical such as a machine you have at home, like a Raspberry Pi, or one rented from a hosting provider like Hetzner.

## Resources

In Coolify, a resource refers to an application or service you set up on your serverâ€”like a website, database, or API.

Each resource comes with its own configuration, like domains, backups, health checks, and so on.

Coolify offers a handy list of pre-set resources, called one-click services, that you can deploy instantly. But if you prefer, you can also deploy your own application easily.

## Environments

In Coolify, a environment is a tailored setup on your server that determines how your resources operate.

For instance, you could have a development environment for testing and debugging your code, alongside a production environment where your finished application goes live.

With Coolify, you can set up multiple environments on a single server, letting you switch between them effortlessly.

## Projects

A project in Coolify is a group of environments and resources youâ€™ve deployed on your server.

It serves as the highest-level structure in Coolify, organizing your deployment setup.

You can manage multiple projects on the same server, each with its own unique set of environments and resources.

For example, you might create one project for all your hobby-related resources and another for work-related ones.

## Containers

In Coolify, everything you deploy runs as a Docker container, making it easy to manage and isolate your application.

You can use pre-built Docker images from public registries like Docker Hub or GitHub Container Registry to deploy without building them yourself.

To deploy, you need a Docker image, either one youâ€™ve built or one from someone else.

If youâ€™re coding your own app, Coolify can auto-build the image from a Dockerfile or Docker Compose file, though this resource-heavy process requires a capable server.

Alternatively, you can build the image elsewhere, push it to a registry, and let Coolify deploy it as a container.

## Reverse Proxy

A reverse proxy is a server or app that sits between your application and users, forwarding requests to the right place.

Coolify includes two proxy options, Caddy and Traefik, which handle requests to your website by directing them to the container running your app.

This setup lets you run multiple applications on one server without tweaking configs or ports.

Plus, Coolify supports unlimited domains, so you could deploy 20 different apps, each with its own unique domain.

The reverse proxy also automatically manages SSL/TLS certificates for your applications. When you enter a domain with `https://`, the proxy requests and installs certificates from [Let's Encrypt](https://letsencrypt.org?utm_source=coolify.io) automatically, with no manual configuration needed. Certificates are renewed automatically before they expire, keeping your applications secure without any intervention.

## Security

Coolify doesnâ€™t manage your serverâ€™s security or updates, thatâ€™s your responsibility to keep everything secure and up to date.

Itâ€™s built to simplify deployment management for you. While the Coolify core team plans to introduce more security features eventually, for now, securing your server is entirely up to you.

## Teams

Coolify supports multiple users and teams, allowing each team to have its own projects and environments.

You can assign roles like admin to users, simplifying project management and collaboration on a single server.

Currently, the teams feature isnâ€™t fully polished for production use, but the Coolify core team plans to enhance it down the line.

---

---
url: /docs/troubleshoot/installation/install-script-failed.md
description: >-
  Debug and fix Coolify installation script failures with step-by-step
  troubleshooting for logs, Docker issues, port conflicts, and container
  problems.
---

# Coolify Installation Script Failed

If the Coolify installation script completes but you cannot access Coolify, or if containers are missing, this guide will help you debug and fix the issue.

## Common Symptoms

* Installation script finishes but **no access URL is displayed**
* Script shows success but **Coolify web interface is not accessible** on port 8000
* **Docker containers are missing** or not running
* Installation appears to complete but **something doesn't work**

::: warning Important
Before following this guide, make sure you read the [Installation Prerequisites](/get-started/installation#before-you-begin) to ensure your system meets all requirements.
:::

## Enable Verbose Mode for Debugging

If you're experiencing installation issues, you can run the installation script in **verbose mode** to see exactly what commands are being executed:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh -o install.sh
bash -x install.sh 2>&1 | tee installation-debug.log
```

This will:

* Show every command as it executes (`bash -x`)
* Display both stdout and stderr (`2>&1`)
* Save all output to `installation-debug.log` for later review (`tee`)

::: tip
Verbose mode is extremely helpful for identifying exactly where the installation fails. Include the verbose log when asking for help in Discord.
:::

## Step 1: Check Installation Logs

The installation script creates log files that contain valuable information about what happened during installation.

### Finding Your Logs

The installation process creates two log files in `/data/coolify/source/`:

1. **Installation log**: `installation-YYYYMMDD-HHMMSS.log`
2. **Upgrade log**: `upgrade-YYYY-MM-DD-HH-MM-SS.log`

::: tip
The installation script calls the upgrade script internally, so both logs are created during initial installation.
:::

### View Your Logs

Find your most recent log files:

```bash
# List all log files sorted by date (most recent first)
ls -lt /data/coolify/source/*.log | head -5
```

View the installation log:

```bash
# Replace the date/time with your actual log file
tail -100 /data/coolify/source/installation-YYYYMMDD-HHMMSS.log

# Or view the entire log
cat /data/coolify/source/installation-YYYYMMDD-HHMMSS.log
```

View the upgrade log:

```bash
# Replace the date/time with your actual log file
tail -100 /data/coolify/source/upgrade-YYYY-MM-DD-HH-MM-SS.log

# Or view the entire log
cat /data/coolify/source/upgrade-YYYY-MM-DD-HH-MM-SS.log
```

### What to Look For

Look for error messages containing:

* `ERROR:`
* `Failed to`
* `could not`
* `Connection refused`
* `Permission denied`
* `No such file or directory`

## Step 2: Verify Docker Installation

Check if Docker is properly installed and running:

```bash
# Check Docker version
docker --version

# Check Docker Compose plugin
docker compose version

# Check if Docker daemon is running
sudo systemctl status docker
```

**Expected output** for `docker --version`:

```
Docker version 27.0.x, build xxxxx
```

If Docker is not installed or not running:

```bash
# Start Docker service
sudo systemctl start docker

# Enable Docker to start on boot
sudo systemctl enable docker
```

::: warning Docker via Snap Not Supported
If you installed Docker via snap, you must remove it and reinstall Docker properly. The installation script will detect and block snap-based Docker installations.

```bash
# Remove Docker snap
sudo snap remove docker

# Then re-run the Coolify installation script
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
```

:::

## Step 3: Check Port Availability

Coolify requires specific ports to be available. The most critical port for initial installation is **port 8000**.

### Check Port 8000 (Coolify Web Interface)

::: danger Critical Port
Port 8000 must be available for Coolify's web interface. If something else is using this port, installation will fail silently.
:::

**On Linux with `ss` (recommended):**

```bash
sudo ss -tulpn | grep :8000
```

**On Linux with `lsof`:**

```bash
sudo lsof -i :8000
```

**On Linux with `netstat`:**

```bash
sudo netstat -tulpn | grep :8000
```

If these commands return **no output**, the port is free âœ“

If they show output, **something is using port 8000**. Example:

```
tcp   LISTEN  0  4096  *:8000  *:*  users:(("some-app",pid=1234,fd=3))
```

### Check Other Coolify Ports

```bash
# Port 6001 (Soketi/Real-time)
sudo ss -tulpn | grep :6001

# Port 5432 (PostgreSQL - usually internal only)
sudo ss -tulpn | grep :5432

# Port 6379 (Redis - usually internal only)
sudo ss -tulpn | grep :6379
```

### Fix Port Conflicts

If port 8000 is in use, you have two options:

**Option 1: Stop the conflicting service**

```bash
# Find the process ID (PID) from the ss/lsof output
sudo kill <PID>

# Or stop the service if you know what it is
sudo systemctl stop <service-name>
```

**Option 2: Change Coolify's port** (Advanced)

Modify `/data/coolify/source/.env` and change the `APP_PORT` variable, then re-run the installation script.

## Step 4: Validate Docker Containers

Check if all Coolify containers are running:

```bash
# List all containers (running and stopped)
docker ps -a

# Filter for Coolify containers only
docker ps -a --filter "name=coolify"
```

### Expected Containers

You should see these containers:

| Container Name     | Status | Purpose                    |
| ------------------ | ------ | -------------------------- |
| `coolify`          | Up     | Main Coolify application   |
| `coolify-realtime` | Up     | Real-time updates (Soketi) |
| `coolify-db`       | Up     | PostgreSQL database        |
| `coolify-redis`    | Up     | Redis cache                |

::: info Note
The `coolify-proxy` container is NOT created during installation. It's created later when you deploy your first application or enable a proxy.
:::

### Check Container Status

If containers are **stopped** or **exited**, check their logs:

```bash
# View logs for specific container
docker logs coolify
docker logs coolify-realtime
docker logs coolify-db
docker logs coolify-redis

# Follow logs in real-time
docker logs -f coolify
```

### Restart Stopped Containers

If containers are stopped, try starting them:

```bash
# Start all Coolify containers
cd /data/coolify/source
docker compose --env-file .env -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Step 5: Verify Docker Images

Check if all required Docker images were pulled successfully:

```bash
# List Coolify-related images
docker images | grep coolify
docker images | grep ghcr.io/coollabsio
```

### Expected Images

You should see at least:

* `ghcr.io/coollabsio/coolify` (or your custom registry)
* `ghcr.io/coollabsio/coolify-helper`
* `ghcr.io/coollabsio/coolify-realtime`

### Missing Images

If images are missing, there may have been a network issue during installation. Try pulling them manually:

```bash
# Pull the latest Coolify images
docker pull ghcr.io/coollabsio/coolify:latest
docker pull ghcr.io/coollabsio/coolify-helper:latest
docker pull ghcr.io/coollabsio/coolify-realtime:latest

# Then restart Coolify
cd /data/coolify/source
docker compose --env-file .env -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate
```

::: tip Registry Authentication
If you're using a custom Docker registry that requires authentication, you may need to run `docker login` first.
:::

## Step 6: Check Docker Networks

Verify that the Coolify Docker network exists:

```bash
# List Docker networks
docker network ls | grep coolify
```

**Expected output:**

```
<network-id>   coolify   bridge   local
```

If the network doesn't exist, create it:

```bash
# Try creating with IPv6 support first
docker network create --attachable --ipv6 coolify

# If that fails, create without IPv6
docker network create --attachable coolify
```

## Step 7: Verify Disk Space

Check available disk space:

```bash
df -h /
```

Coolify requires:

* **Minimum 30GB total disk space**
* **Minimum 20GB available space**

::: warning Low Disk Space
If you have less than the required space, the installation may complete but fail during operation. Consider:

* Cleaning up unused Docker resources: `docker system prune -a`
* Expanding your disk/volume
* Using a larger server
  :::

## Common Issues & Solutions

### Issue: Script Completes But No Access URL Shown

**Symptoms:**

* Installation script finishes
* No error messages
* But no URL like `http://your-ip:8000` is displayed

**Possible causes:**

1. Container creation failed silently
2. Network issues prevented fetching public IP
3. Docker images failed to pull

**Solution:**

```bash
# Check if containers are running
docker ps --filter "name=coolify"

# If containers are missing, check upgrade log
cat /data/coolify/source/upgrade-*.log

# Look for errors in the log, then re-run upgrade
cd /data/coolify/source
bash upgrade.sh latest latest ghcr.io false
```

### Issue: Port 8000 Already in Use

**Symptoms:**

* Installation completes
* Containers appear to be running
* But Coolify web interface is not accessible

**Solution:**

See [Step 3: Check Port Availability](#step-3-check-port-availability) above.

### Issue: Docker Image Pull Failures

**Symptoms:**

* Installation takes very long time
* Errors like "failed to pull image" or "manifest unknown"
* Some Docker images are missing

**Possible causes:**

1. Network connectivity issues
2. DNS resolution problems
3. Registry rate limiting
4. Custom registry authentication issues

**Solution:**

```bash
# Test network connectivity to GitHub Container Registry
curl -I https://ghcr.io

# Check DNS resolution
nslookup ghcr.io

# Try pulling images manually
docker pull ghcr.io/coollabsio/coolify:latest

# If using custom registry, login first
docker login your-registry.com
```

### Issue: Insufficient Permissions

**Symptoms:**

* "Permission denied" errors in logs
* Cannot create directories
* Cannot modify files in `/data/coolify/`

**Solution:**

The installation script must be run as **root** or with **sudo**:

```bash
# Re-run with sudo
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
```

### Issue: SSH Configuration Problems

**Symptoms:**

* Installation completes
* Coolify accessible but cannot connect to localhost server
* SSH-related errors in Coolify interface

**Possible cause:**

* SSH `PermitRootLogin` is disabled
* SSH keys not properly configured

**Solution:**

Check SSH configuration:

```bash
# Check PermitRootLogin setting
sudo sshd -T | grep permitrootlogin
```

Should show:

* `permitrootlogin yes`, or
* `permitrootlogin prohibit-password`, or
* `permitrootlogin without-password`

If it shows `permitrootlogin no`, see the [OpenSSH Configuration Guide](/knowledge-base/server/openssh).

## Manual Verification Checklist

Run these commands to get a complete diagnostic report:

```bash
echo "=== COOLIFY INSTALLATION DIAGNOSTICS ==="
echo ""

echo "1. Installation Logs:"
ls -lt /data/coolify/source/*.log 2>/dev/null | head -5 || echo "No logs found"
echo ""

echo "2. Docker Version:"
docker --version
docker compose version
echo ""

echo "3. Docker Service Status:"
sudo systemctl status docker --no-pager -l
echo ""

echo "4. Coolify Containers:"
docker ps -a --filter "name=coolify" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "5. Docker Images:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep -E "REPOSITORY|coolify"
echo ""

echo "6. Docker Networks:"
docker network ls | grep -E "NETWORK|coolify"
echo ""

echo "7. Port 8000 Status:"
sudo ss -tulpn | grep :8000 || echo "Port 8000 is free"
echo ""

echo "8. Disk Space:"
df -h /
echo ""

echo "9. Environment File:"
ls -lh /data/coolify/source/.env 2>/dev/null || echo ".env file not found"
echo ""
```

Copy the output of this diagnostic script when asking for help.

## Recovery Steps

### Clean Re-installation

If you want to completely uninstall and start fresh:

::: danger Warning
This will remove all Coolify data including applications, databases, and settings!
:::

Follow the [Uninstallation Guide](/get-started/uninstallation) to properly remove Coolify, then re-run the installation script:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
```

### Retry Installation Without Full Reset

If you just want to retry without losing data:

```bash
# Re-run the installation script
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
```

The script is designed to be **idempotent** (safe to run multiple times).

### Use Manual Installation

If the automated script continues to fail, try the [Manual Installation](/get-started/installation#manual-installation) method.

## Getting Help

If you've followed all the steps above and still have issues, please ask for help in our [Discord community](https://coolify.io/discord).

### Information to Provide

When asking for help, include:

1. **Your system information:**

   ```bash
   cat /etc/os-release
   uname -m
   ```

2. **Installation logs:** (last 100 lines)

   ```bash
   tail -100 /data/coolify/source/installation-*.log
   tail -100 /data/coolify/source/upgrade-*.log
   ```

3. **Docker status:**

   ```bash
   docker ps -a --filter "name=coolify"
   docker images | grep coolify
   ```

4. **Any error messages** you see in logs or on screen

5. **What you've already tried** to fix the issue

This information will help the community diagnose your problem much faster!

## Related Documentation

* [Installation Guide](/get-started/installation)
* [Manual Installation](/get-started/installation#manual-installation)
* [Firewall Configuration](/knowledge-base/server/firewall)
* [OpenSSH Configuration](/knowledge-base/server/openssh)
* [Raspberry Pi OS Setup](/knowledge-base/how-to/raspberry-pi-os)
* [Docker Installation Failed](/troubleshoot/installation/docker-install-failed)

---

---
url: /docs/knowledge-base/self-update.md
description: >-
  Configure automatic Coolify updates with custom cron schedules, manual update
  options, and service template synchronization for self-hosted instances.
---

# Coolify Instance Updates - Self-hosted

## Update Settings

You can configure your Coolify instance's update settings on the `Settings` page under the `Update` section.

There are two main update configurations:

1. **Update Check Frequency**
   * Controls how often Coolify checks for:
     * New Coolify versions
     * New Service Templates from CDN
   * Default: Every hour
   * Uses cron syntax

2. **Auto Update Frequency**
   * Controls when Coolify automatically installs updates
   * Default: Daily at midnight (00:00)
   * Uses cron syntax

## Auto Update Toggle

* By default, `Auto Update Enabled` is turned on for self-hosted instances
* You can disable automatic updates which is recommended for production instances. Please note that disabling `Auto Update Enabled` will not disable the update check frequency as updates should be checked periodically.
* If you disable `Auto Update Enabled`, you can still manually update Coolify by clicking the `Update` button once a new version is available.

## Configuring Update Schedules

Both update frequencies use cron syntax for scheduling. For detailed information about the supported cron syntax, please see our [cron syntax guide](/knowledge-base/cron-syntax).

## Version Availability

For details about the availability and versioning scheme of new versions please read the [RELEASE.md](https://github.com/coollabsio/coolify/blob/main/RELEASE.md) file on GitHub:

---

---
url: /docs/troubleshoot/dns-and-domains/wildcard-ssl-certs.md
description: >-
  Fix wildcard SSL certificate issues in Coolify by verifying installation,
  checking proxy configuration, and clearing browser cache.
---

# Coolify not using Wildcard SSL Certificates

If your wildcard SSL certificate isn't working with your domain, it may be due to configuration problems. Here's how you can check and fix it.

## 1. Check the SSL Certificate Validity

* **Verify the Certificate:** Make sure the SSL certificate is valid for the domain.
  * Confirm the Common Name (CN) matches your domain.
  * Double-check that your wildcard certificate is not expired.

## 2. Verify Certificate Installation

* **File Extensions:** Make sure the SSL certificate file ends with `.cert` and the key file ends with `.key`.
  * Some providers give files in `.pem` format, which must be converted to `.cert` and `.key` before adding them to your server (simply rename the files to `.cert` for the certificate and `.key` for the key)
* **File Location:** Make sure your `.cert` and `.key` files are located in the `/data/coolify/proxy/certs` directory.

## 3. Check the Coolify Proxy Configuration

* **Add Certificate in Dashboard:** Make sure you have added the SSL certificate configuration in the Coolify proxy via the dashboard. More details can be found [here](/knowledge-base/proxy/traefik/custom-ssl-certs).
* **Check File Mounts:** If you have modified the proxy configuration, verify that the `/data/coolify/proxy` directory is mounted correctly.

## 4. Remove Old Certificates

* **Old Certificate Issue:** The Coolify proxy may be using an old certificate stored in the `acme.json` file.
* **Action:** Delete the `acme.json` file from the `/data/coolify/proxy` directory and restart the Coolify proxy from the dashboard by clicking the restart proxy button.

## 5. Clear Your Browser Cache

* **Cache Issue:** Your browser might be caching an old SSL certificate.
* **Action:** Check your website using a different browser or network.
  * You can also use sandbox tools like [Browserling](https://www.browserling.com?utm_source=coolify.io) to test your site.

## 6. Verify DNS Challenge Configuration

* **DNS Challenge Check:** If you are using a DNS challenge, confirm that it is set up correctly.
* **Action:** Verify that you have selected the correct DNS provider, API Keys and check the challenge settings are properly configured.

## Support

If none of the above steps work, try these additional options:

* **Community Help:** Join our [Discord community](https://coolify.io/discord) and post in the support forum channel.
* **What to Share:** Include a description of your issue, screenshots of your configuration, any error messages, and the steps you have already tried.

---

---
url: /docs/get-started/sponsors.md
description: >-
  Meet the companies and organizations sponsoring Coolify development including
  Hetzner, Logto, Tolgee, and other technology partners.
---


---

---
url: /docs/get-started/videos.md
description: >-
  Watch community video tutorials on Coolify self-hosted PaaS including
  installation, deployment, and complete walkthroughs for beginners.
---

# Video Tutorials created by the community

Only few of the videos are listed here

### Syntax: 1.5 hours long complete walkthrough

### WebdevCody: 6 minutes quick overview

### Developedbyed: 20 minutes overview

### Fireship video

### MelkeyDev video

### Brendan O'Connell

### Awesome Open Source

### Airoflare Coolify beginner playlist

---

---
url: /docs/get-started/screenshots.md
description: >-
  View screenshots of Coolify's user interface showing dashboard, deployment
  options, server management, and application configuration features.
---

# Coolify UI Screenshots

The Coolify team is currently developing a brand new UI design. Below are the images showing the current UI.

---

---
url: /docs/get-started/team.md
description: >-
  Meet the international team developing Coolify including founder Andras
  Bacsai, core developers, community leads, and documentation maintainers.
---


---

---
url: /docs/knowledge-base/create-root-user-with-env.md
description: >-
  Create Coolify root user during installation with environment variables
  including email validation, username requirements, and strong password
  policies.
---

# Create Root User with Environment Variables

Creating the root user during installation is optional but recommended as it prevents the registration page from ever being exposed.

## Validation Requirements

The following requirements must be met for the root user credentials in a production environment.

### Email

* Must be a valid email address
* Must have a valid DNS record
* Maximum length: 255 characters

### Username

* Minimum length: 3 characters
* Maximum length: 255 characters
* Can only contain letters, numbers, spaces, underscores, and hyphens

### Password

* Minimum length: 8 characters
* Must contain both uppercase and lowercase letters
* Must contain at least one number
* Must contain at least one special symbol
* Must not be a commonly used or compromised password

## Automated Installation Method

1. **Prepare Your Credentials**

   Create your root user credentials according to the validation requirements above.

2. **Run Installation Command**

   Execute the automated installation script with your prepared credentials:

   ```bash
   env ROOT_USERNAME=RootUser ROOT_USER_EMAIL=example@example.com ROOT_USER_PASSWORD=Password bash -c 'curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash'
   ```

   > View the [Scripts Source Code](https://github.com/coollabsio/coolify/blob/main/scripts/install.sh)

::: info
The installation script must be run as `root`. If you're not logged in as `root`, the script will use `sudo` to elevate privileges.

```bash
sudo -E env ROOT_USERNAME=RootUser ROOT_USER_EMAIL=example@example.com ROOT_USER_PASSWORD=Password bash -c 'curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash'
```

:::

::: warning
If any of the environment variables values contain a space, wrap the values in double quotes, for example `ROOT_USERNAME="Root User"`.
:::

3. **Complete Setup**
   After configuring the root user credentials, continue with the [installation steps](/get-started/installation#quick-installation-recommended) to complete your Coolify setup.

## Manual Installation Method

1. **Prepare Your Credentials**

   Create your root user credentials according to the validation requirements above.

2. **Configure Environment Variables**

   Edit the environment variables file:

   ```bash
   nano /data/coolify/source/.env
   ```

   Add the following variables with your prepared credentials:

   ```bash
   ROOT_USERNAME=RootUser
   ROOT_USER_EMAIL=example@example.com
   ROOT_USER_PASSWORD=Password
   ```

::: warning
If any of the environment variables values contain a space, wrap the values in double quotes, for example `ROOT_USERNAME="Root User"`
:::

3. **Complete Setup**
   After configuring the root user credentials, continue with the [installation steps](/get-started/installation#quick-installation-recommended) to complete your Coolify setup.

---

---
url: /docs/knowledge-base/destinations/create.md
description: >-
  Create Docker network destinations in Coolify for standalone or Swarm
  deployments with automatic proxy configuration and network scanning.
---

# Creating Destinations

This guide shows you how to create new destinations in Coolify for deploying your applications and databases.

## Prerequisites

Before creating a destination, ensure you have:

* At least one server connected to Coolify
* Appropriate permissions to manage destinations
* Basic understanding of [Docker networks](https://docs.docker.com/engine/network/)

## Creating a New Destination

### Method 1: From Destinations Page

1. Navigate to **Destinations** in the main navigation
2. Click on **+ Add**
3. Fill in the destination details.

### Method 2: From Server Management

1. Go to **Servers** and select your server
2. Navigate to the **Destinations** tab
3. Click **+ Add**
4. Fill in the destination details.

## Configuration Options

### Destination Name

* Auto-generated based on server name and network ID
* Can be customized to be more descriptive

### Network Name

* Must be unique per server
* Auto-generated unique identifier (CUID2 format)
* Can be customized to be more descriptive
* Cannot be changed after creation
* Used as the actual Docker network name

### Server Selection

* Choose from available servers in your team
* Server must be online and accessible
* Can not be a [build server](/knowledge-base/server/build-server)
* Determines where the Docker network will be created

### Destination Type

The destination type is **automatically determined** based on your selected server's configuration:

#### Standalone Docker

* **Automatically selected** when the server is configured as a standalone Docker host
* Creates a standard Docker network
* Suitable for single-server deployments
* Supports bridge and custom networks

#### Docker Swarm

* **Automatically selected** when the server is configured as a Docker Swarm manager or worker
* Creates overlay networks for multi-node communication
* Server must have Docker Swarm mode enabled during server setup
* Advanced feature for clustered deployments

::: tip Server Configuration Determines Type
You cannot manually choose between Standalone Docker and Docker Swarm when creating a destination. The type is determined by how your server was configured when it was added to Coolify.
:::

## Automatic Network Creation

When you create a destination, Coolify automatically:

1. **Creates the Docker network** on the target server
2. **Connects the proxy** (Traefik/Caddy) to the network
3. **Configures network settings** for proper isolation
4. **Enables inter-container communication** within the network

## Network Scanning

You can also scan existing Docker networks on a server and add them as destinations:

1. Go to **Server** and select your server
2. Navigate to **Destinations**
3. Click **Scan for Destinations**
4. Select existing networks to import and Coolify will create destination entries for them

## Validation and Errors

Common errors when creating destinations:

* **Network already added to this server**: The network name conflicts with an existing one

## After Creation

Once created, your destination will:

* Appear in the destinations list
* Be available for deploying applications and databases
* Have network connectivity configured automatically
* Be ready to host your containerized resources

---

---
url: /docs/services/cryptgeon.md
description: >-
  Share secrets securely on Coolify with Cryptgeon featuring self-destructing
  messages, end-to-end encryption, and no server-side storage.
---

# Cryptgeon

## What is Cryptgeon

Secure note / file sharing service inspired by PrivNote.

## Links

* [Official Documentation](https://github.com/cupcakearmy/cryptgeon?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/docker/custom-commands.md
description: >-
  Add custom Docker run options to Coolify deployments including custom
  entrypoints, GPU support, security options, system controls, devices, and
  resource limits.
---

# Custom Commands

For deploying your resources, you can add custom options to the final docker command, which is used to run your container.

::: warning Caution
Some of the docker native options are not supported, because it could break the Coolify's functionality. If you need any of the unsupported options, please [contact us](/get-started/support)
:::

## Supported Options

* `--ip`
* `--ip6`
* `--shm-size`
* `--cap-add`
* `--cap-drop`
* `--security-opt`
* `--sysctl`
* `--device`
* `--ulimit`
* `--init`
* `--ulimit`
* `--privileged`
* `--gpus`
* `--entrypoint`

## Usage

You can simply add the options to the `Custom Docker Options` field on the `General` tab of your resource.

Example: `--cap-add SYS_ADMIN --privileged`

## Custom Entrypoint

The `--entrypoint` option allows you to override the default entrypoint of a Docker image without building a custom image.

### Syntax

Coolify supports three entrypoint syntax variations:

1. **Simple entrypoint**:
   ```bash
   --entrypoint /bin/sh
   ```

2. **Quoted command with arguments**:
   ```bash
   --entrypoint "sh -c 'npm start'"
   ```

3. **Assignment syntax**:
   ```bash
   --entrypoint=/usr/local/bin/custom-script
   ```

### Use Cases

#### Multiple Service Types from Single Image

Some Docker images, like ServerSideUp PHP, provide multiple entrypoints for different service types:

* Worker processes
* Queue schedulers
* Background jobs
* Web servers

Example for running a Laravel Horizon worker:

```bash
--entrypoint php --entrypoint artisan --entrypoint horizon
```

#### Custom Initialization Scripts

Override the default entrypoint to run custom initialization:

```bash
--entrypoint "/app/custom-init.sh"
```

### Usage in Coolify

1. Navigate to your resource's **General** tab
2. Locate the **Custom Docker Options** field
3. Add your entrypoint option along with any other custom options:
   ```bash
   --entrypoint /bin/sh --cap-add SYS_ADMIN
   ```
4. Save and redeploy your application

::: info Note
The entrypoint option is converted to Docker Compose format during deployment, supporting both Dockerfile and Docker Compose build packs.
:::

---

---
url: /docs/knowledge-base/custom-docker-registry.md
description: >-
  Switch between Docker Hub and GitHub Container Registry (ghcr.io) for pulling
  Coolify images during installation or runtime
---

# Custom Docker Registry

If you would like to get Coolify's images from `dockerhub` instead of the default `ghcr.io`, you can do it by setting the `REGISTRY_URL` environment variable to `docker.io`.

## Registry URL (`REGISTRY_URL`)

* Valid values: `docker.io` & `ghcr.io`.

## Automated Installation Method

1. **Run Installation Command**

   Execute the automated installation script with your prepared credentials:

   ```bash
   env REGISTRY_URL=docker.io bash -c 'curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash'
   ```

   > View the [Scripts Source Code](https://github.com/coollabsio/coolify/blob/main/scripts/install.sh)

::: info
The installation script must be run as `root`. If you're not logged in as `root`, the script will use `sudo` to elevate privileges.

```bash
sudo -E env REGISTRY_URL=docker.io bash -c 'curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash'
```

:::

## Manual Installation Method

1. **Configure Environment Variables**

   Edit the environment variables file:

   ```bash
   nano /data/coolify/source/.env
   ```

   Add the following variables with your prepared credentials:

   ```bash
   REGISTRY_URL=docker.io
   ```

## Switch after installation

If you want to switch the registry after installation, you can do it by running the following command:

```bash
env REGISTRY_URL=docker.io bash -c 'curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash'
```

::: info
The installation script must be run as `root`. If you're not logged in as `root`, the script will use `sudo` to elevate privileges.

```bash
sudo -E env REGISTRY_URL=docker.io bash -c 'curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash'
```

---

---
url: /docs/knowledge-base/proxy/traefik/custom-ssl-certs.md
description: >-
  Use custom SSL certificates with Traefik proxy in Coolify including
  self-signed certificates, Let's Encrypt, and public CA certificates
  configuration.
---

# Custom SSL Certificates

If you want to use custom SSL certificates with Traefik, you can easily do so by following the steps below.

On each server, `/data/coolify/proxy` is mounted into the Coolify Proxy (Traefik) container.

You can add your custom SSL certificates in the `/data/coolify/proxy/certs` directory.

1. Generate or request an SSL certificate
   Generate or request an SSL certificate for your domain. It can be a
   self-signed certificate, a certificate from a public CA, or a certificate
   from Let's Encrypt.

   Read more [here](https://certbot.eff.org/instructions) about certbot and Let's Encrypt.

2. Copy the key and cert files to the server
   Copy the key and cert files to the server where your resource that will use the certificate is running.
   Use `scp` or any other method to copy the files.

   It should be placed under `/data/coolify/proxy` directory, for example:

   ```bash
   scp /path/to/your/domain.cert root@your-server-ip:/data/coolify/proxy/certs/domain.cert
   scp /path/to/your/domain.key root@your-server-ip:/data/coolify/proxy/certs/domain.key
   ```

   ::: tip Tip
   Make sure the directory `/data/coolify/proxy/certs` exists on the server.
   :::

3. Configure Traefik
   You can configure Traefik to use the custom SSL certificates by adding a dynamic configuration file through Coolify's UI or directly adding it to `/data/coolify/proxy/dynamic`:

   ```yaml
   tls:
     certificates:
       - certFile: /traefik/certs/domain.cert
         keyFile: /traefik/certs/domain.key
       - certFile: /traefik/certs/domain2.cert
         keyFile: /traefik/certs/domain2.key
   ```

   ::: tip Tip
   `/traefik` is the directory inside `coolify-proxy` container where
   `/data/coolify/proxy` is mounted.
   :::

   Traefik will automatically use this certificate if it matches the domain of the incoming request and the certificate in any of the provided files.

For more information check Traefik's [official documentation](https://doc.traefik.io/traefik/https/tls/).

---

---
url: /docs/services/cyberchef.md
description: >-
  Run CyberChef data analysis on Coolify for encoding, decoding, encryption,
  compression, and data transformation with 300+ operations.
---

# Cyberchef

## What is Cyberchef

The Cyber Swiss Army Knife - a web app for encryption, encoding, compression and data analysis

## Links

* [Official Documentation](https://github.com/gchq/CyberChef?utm_source=coolify.io)

---

---
url: /docs/services/dashboard.md
description: >-
  Deploy customizable dashboard on Coolify for application shortcuts, bookmarks,
  service monitoring, and centralized access to self-hosted tools.
---

::: warning SERVICE NOT AVAILABLE
This service is currently not available in Coolify's service catalog.
:::

![dashboard](https://i.imgur.com/tOnPDYQ.png)

## What is Dashboard?

Dashboard is just that - a dashboard. It's inspired by [SUI](https://github.com/jeroenpardon/sui) and has all the same features as SUI, such as simple customization through JSON-files and a handy search bar to search the internet more efficiently.

## Features

So what makes this project different from (or even better than) SUI?

* "Display URL" functionality (The URL displayed for apps can differ from the actual URL)
* Categorization for apps
* Themes and search providers can be changed using JSON
* Imprint functionality

## Links

* [GitHub](https://github.com/phntxx/dashboard?utm_source=coolify.io)

---

---
url: /docs/troubleshoot/dashboard/dashboard-inaccessible.md
description: >-
  Fix Coolify dashboard access issues by checking proxy status, container
  health, firewall ports, and resolving domain configuration.
---

# Coolify Dashboard Inaccessible

Having trouble accessing your Coolify dashboard? follow these steps to diagnose and resolve the issue.

## 1. Determine Your Access Method

First, ask yourself: **How are you trying to access the dashboard?**

* **Custom Domain:** If youâ€™re using the domain you set up for your Coolify dashboard, the problem might be with the Coolify proxy.
* **Direct Server IP:** If youâ€™re using your serverâ€™s IP address, the issue could be related to your server or container status.

## 2. Test with Your Serverâ€™s IP Address

### A. Open Your Firewall Port

* **Step:** Make sure that port `8000` is open on your firewall.
* **Why:** This allows direct access to the Coolify dashboard without any proxy interference.

### B. Access the Dashboard Directly

* **Step:** Open your web browser and go to: `http://203.0.113.1:8000` *(Replace `203.0.113.1` with your actual server IP address)*
* **Observation:**
  * If you see the login page, the dashboard is working fine without proxy (skip to [step 4](#_4-addressing-proxy-related-issues)).
  * If you don't see the login page, the issue might be with your server or coolify docker containers.

## 3. Check the Coolify Container

If the dashboard isnâ€™t accessible via the IP address, then follow these steps:

### A. Verify the Container Status

* **Step:** SSH into your server.
* **Command:**
  ```bash
  docker ps --format "table {{.Names}}\t{{.Status}}"
  ```
* **What to Look For:**

  * Make sure the coolify containers are running and its status is healthy.

### B. Restart the Container (if necessary)

* **Step:** If the container appears to be running but youâ€™re still having issues, try restarting it.
* **Commands:**
  ```bash
  docker restart NAME
  ```
  *(Replace `NAME` with your actual container name)*
* **Test:** After restarting, try accessing `http://203.0.113.1:8000` *(Replace `203.0.113.1` with your actual server IP address)* again. If this doesn't work, skip to [step 5](#_5-getting-further-assistance)

### C. Conflict Coolify-Related Containers Port

Sometimes, the issue occurs if a non-Coolify container is using the same port (e.g., port 8000) as Coolify's dashboard, causing a conflict.

* **Steps:**

1. SSH into your server.
2. Stop all Docker containers gracefully:
   ```bash
   docker stop $(docker ps -q)
   ```
3. Start only the containers related to Coolify:
   ```bash
   docker start $(docker ps -a -q --filter "name=coolify")
   ```
4. Try accessing your Coolify dashboard again. The dashboard should now be accessible since conflicts on port 8000 are cleared.

* **Next:** Check your containers for the same port as your Coolify instance through the Coolify dashboard and change the port accordingly (don't forget to verify firewall rules)

## 4. Addressing Proxy-Related Issues

If the dashboard is accessible via the server IP but not through your custom domain, then follow these steps:

### A. Start the Proxy

* **Step:** Go to the **Proxy** page in your Coolify dashboard.

* **Action:** Click the **Start Proxy** button.

* **Wait:** Give it about two minutes, then try accessing your dashboard using your custom domain.

### B. Review Recent Changes

* **Question:** Did you change any proxy configurations before the issue started?

  * **If Yes:** Reset the proxy configuration to its default settings and restart the proxy.

  * **Wait:** Give it about two minutes, then try accessing your dashboard using your custom domain.

### C. Check Proxy Logs

* **Step:** Look at the proxy logs for any error or warning messages.

* **Next:** If you see errors, they may hint at what needs to be fixed (skip to next step).

## 5. Getting Further Assistance

If none of the above steps work, then follow this:

* **Community Help:** Join our [Discord community](https://coolify.io/discord) and create a post in the support forum channel.
* **What to Share:** Include the exact error messages youâ€™re seeing and a description of the steps youâ€™ve already tried.

## Summary of Common Issues

* **Proxy Not Running:** Most issues are often due to the Coolify proxy not running.
* **Proxy Misconfiguration:** Incorrect settings in your proxy configuration can block access.
* **Container Health:** An unhealthy Coolify container may be the problem.

---

---
url: /docs/services/dashy.md
description: >-
  Host Dashy dashboard on Coolify with customizable widgets, service health
  checks, themes, icons, and organized homepage for self-hosted services.
---

# Dashy

## What is Dashy

A self-hostable personal dashboard built for you. Includes status-checking, widgets, themes, icon packs, a UI editor and tons more!

## Links

* [Official Documentation](https://dashy.to/docs?utm_source=coolify.io)

---

---
url: /docs/databases/ssl.md
description: >-
  Secure database connections on Coolify with SSL encryption, automatic
  certificate generation, and multiple SSL modes for enhanced security.
---

# Database SSL &#x20;

Database SSL in Coolify encrypts the communication between your applications and databases, ensuring that data remains secure.

With automatic certificate binding and generation, this feature simplifies secure setup. It was first introduced in Coolify version **v4.0.0-beta.399**.

## Introduction

Database SSL adds an extra layer of security by encrypting data exchanged with your database. This guide covers:

* Enabling SSL mode for your database connections.
* Selecting the appropriate SSL mode based on your security needs.
* Managing the CA certificate that verifies database connections.

## 1. How to Enable Database SSL

To secure your database connection with SSL:

1. **Access Database Settings**\
   In your Coolify dashboard, access the general settings of the database you want to secure.


2. **Enable SSL Mode**\
   Check the **Enable SSL** option to activate SSL for the database connection.


3. **Select the SSL Mode**\
   Choose the SSL mode from the dropdown menu. For example, select **verify-full** for maximum security.\


::: warning **Note:**\
To make use of SSL after enabling it, you need to use the new connection URL for your app, which includes the SSL configuration.

If you are not using the new URL, the database connection will not use SSL (in most cases).
:::

Coolify automatically binds the generated certificates and keys to the required locations, so manual changes are only needed if you wish to use custom certificates.

## 2. SSL Modes Explained

Coolify supports several SSL modes, each providing a different level of security:


### PostgreSQL

* **allow (insecure)**\
  This mode permits both encrypted and unencrypted connections. It does not enforce SSL, so if SSL fails, the connection will fall back to an unencrypted state.

  This option is considered insecure because it allows unencrypted traffic.

* **prefer (secure)**\
  With this mode, Coolify will attempt to use SSL first. If an SSL connection is available, it will be used, otherwise, it will fall back to an unencrypted connection.

  While this option prefers encryption, it doesnâ€™t guarantee that every connection will be secured.

* **require (secure)**\
  This mode mandates that the connection must be encrypted. However, it does not perform any checks on the server certificate.

  This means the connection is encrypted, but the identity of the server is not verified.

* **verify-ca (secure)**\
  This option goes a step further by encrypting the connection and verifying that the server's certificate is signed by a trusted Certificate Authority (CA). It does not check if the hostname matches the certificate.

  This mode offers a balance between security and ease of setup.

* **verify-full (secure)**\
  This is the most secure mode. It not only encrypts the connection and verifies the certificate authority but also confirms that the serverâ€™s hostname matches the certificate.

  This provides full assurance that you are connecting to the correct server, similar to the security level provided by Cloudflare Origin Certificate setups.

### Other Databases

* **MySQL & MongoDB:**\
  Only the following modes are available: **prefer, require, verify ca, verify full**.
* **MariaDB, Redis, KeyDB, DragonFly DB:**\
  No SSL modes are visible in the UI.
* **Clickhouse DB:**\
  SSL is not supported, there is no checkbox to enable SSL nor dropdown options.

::: warning Developer Note
Modes lower than **require** are not 100% secure as they only encrypt the connection without full verification of the serverâ€™s identity.

For modes higher than **require** (i.e., **verify-ca** and **verify-full**), you must mount the Coolify CA certificate into the container that connects to the database for additional security.

Note that in most cases (for example, PostgreSQL), merely enabling SSL does nothing unless you use the new connection URL that enforces SSL.

However, for some databases, like the redis-based ones, enabling SSL in the UI does enforce the mode.
:::

::: success Tip
For maximum security, **verify-full** is recommended (when available).
:::

## 3. CA SSL Certificate Management

Coolify manages the CA certificate automatically, ensuring that secure database connections are validated.

In the dashboard, under **Servers > YOUR\_SERVER\_NAME > Proxy > Advanced**, you can see the following options:


* **CA SSL Certificate**: Displays the current CA certificate used.
* **Save Certificate**: Allows you to save a local copy of the certificate.
* **Regenerate Certificate**: Lets you generate a new CA certificate if needed.

### Recommended Configuration

For secure connections, mount the Coolify CA certificate into all containers that need to connect to your databases.

The recommended bind mount is:

```sh
/data/coolify/ssl/coolify-ca.crt:/etc/ssl/certs/coolify-ca.crt:ro
```

## 4. Using a Custom CA Certificate

If you wish to use your own CA certificate instead of the one generated by Coolify:

1. **Prepare Your CA Certificate**\
   Make sure your certificate is in PEM format.

2. **Upload Your Certificate**\
   Upload your custom CA certificate in the following location:
   ```sh
   /data/coolify/ssl/coolify-ca.crt
   ```

3. **Mount the Certificate**\
   Make sure that the container that requires database access mounts the certificate at:
   ```sh
   /data/coolify/ssl/coolify-ca.crt:/etc/ssl/certs/coolify-ca.crt:ro
   ```

---

---
url: /docs/knowledge-base/define-custom-docker-network-with-env.md
description: >-
  Configure custom Docker network CIDR blocks and address pools using
  environment variables during Coolify installation for advanced network setups
---

# Define Custom Docker Network with Environment Variables

## Validation Requirements

The following requirements must be met for the custom docker network in a production environment.

### Network Name (`DOCKER_ADDRESS_POOL_BASE`)

* Must be a valid CIDR block, like `10.0.0.0/8`.

### Address Pool Size (`DOCKER_ADDRESS_POOL_SIZE`)

* Must be a valid number, like `10`.

### Force Override (`DOCKER_POOL_FORCE_OVERRIDE`)

* This only needed if you already have a docker address pool on the host and you want to override it.

## Automated Installation Method

1. **Prepare Your Credentials**

   Create your root user credentials according to the validation requirements above.

2. **Run Installation Command**

   Execute the automated installation script with your prepared credentials:

   ```bash
   env DOCKER_ADDRESS_POOL_BASE=10.0.0.0/8 DOCKER_ADDRESS_POOL_SIZE=10 bash -c 'curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash'
   ```

   > View the [Scripts Source Code](https://github.com/coollabsio/coolify/blob/main/scripts/install.sh)

::: info
The installation script must be run as `root`. If you're not logged in as `root`, the script will use `sudo` to elevate privileges.

```bash
sudo -E env DOCKER_ADDRESS_POOL_BASE=10.0.0.0/8 DOCKER_ADDRESS_POOL_SIZE=10 bash -c 'curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash'
```

:::

3. **Complete Setup**
   After configuring the root user credentials, continue with the [installation steps](/get-started/installation#quick-installation-recommended) to complete your Coolify setup.

## Manual Installation Method

1. **Prepare Your Credentials**

   Create your root user credentials according to the validation requirements above.

2. **Configure Environment Variables**

   Edit the environment variables file:

   ```bash
   nano /data/coolify/source/.env
   ```

   Add the following variables with your prepared credentials:

   ```bash
   DOCKER_ADDRESS_POOL_BASE=10.0.0.0/8
   DOCKER_ADDRESS_POOL_SIZE=10
   DOCKER_POOL_FORCE_OVERRIDE=false
   ```

3. **Complete Setup**
   After configuring the root user credentials, continue with the [installation steps](/get-started/installation#manual-installation) to complete your Coolify setup.

---

---
url: /docs/knowledge-base/delete-user.md
description: >-
  Safely delete users from Coolify with automatic team ownership transfer,
  resource cleanup, and team member reassignment procedures.
---

# Delete User

This guide will show you how to delete a user from the self-hosted Coolify instance.

::: warning Caution
If you delete a user, and Coolify still has connection to the servers, it will
delete all the resources on the servers as well, not just from Coolify's
database.
:::

Only users who are in the `root` team can delete users from the UI.

* Go to the `Team` page.
* Switch to `Admin View` tab.

Here you can see all the users registered in Coolify. Click on the `Delete` button next to the user you want to delete.

## Deletion process

::: info Tip
The root team or root user cannot be deleted.
:::

Coolify iterate over all the teams of a user and decide of the followings:

### The user is alone in the team

The team and all resources from the server and from Coolify's database are deleted.

### The user is not alone in the team

1. The user is the owner/admin of the team and no other owners/admins found, but the team **has members**:
   * The ownership is transferred to the first user in the team who is not the owner/admin.
   * The user is removed from the team. No resources are deleted.

2. The user is the owner/admin of the team and no other owners/admins found, but the team has **no members**:
   * The team and all resources from the server and from Coolify's database are deleted.

3. The user is not the owner/admin of the team:
   * The user is removed from the team. No resources are deleted.

---

---
url: /docs/services/denokv.md
description: >-
  Run Deno KV database on Coolify for edge-compatible key-value store with ACID
  transactions, real-time sync, and serverless architecture support.
---

# Denokv

## What is Deno KV

Deno KV is a self-hosted, JavaScript-first key-value database built directly into the Deno runtime. It provides a robust, high-performance data storage solution powered by FoundationDB and SQLite, designed for modern edge computing and serverless applications.

Key features include:

* **ACID Transactions**: Guaranteed data consistency with full ACID transaction support, preventing partial writes and data corruption
* **Built on FoundationDB**: Enterprise-grade backend capable of handling millions of operations per second
* **Real-time Watch API**: Monitor database changes in real-time for building reactive applications, notifications, and live updates
* **Zero Configuration**: Works out of the box with the Deno runtime, no complex setup required
* **JavaScript Native**: Store any JavaScript value directly without manual serialization
* **Hierarchical Keys**: Organize data with structured, REST-like key patterns for intuitive data modeling
* **Multiple Consistency Levels**: Balance between performance and consistency based on your application needs
* **Self-hosted & Open Source**: MIT licensed with full control over your infrastructure

## Links

* [Official Website](https://deno.com/kv?utm_source=coolify.io)
* [Official Documentation](https://docs.deno.com/deploy/kv/manual/?utm_source=coolify.io)
* [GitHub Repository](https://github.com/denoland/denokv?utm_source=coolify.io)

---

---
url: /docs/integrations/webstudio.md
description: >-
  Complete guide to deploying Webstudio projects with Coolify on Hetzner servers
  using Docker, GitHub integration, and automated deployment.
---

# Deploy Webstudio Projects using Coolify

Coolify makes deploying your Webstudio projects to Hetzner as simple as it is powerful.

In this guide, youâ€™ll learn how to set up your project, deploy it on a Hetzner server, and keep your infrastructure fully under your control, all with a few straightforward steps.

::: warning HEADS UP!
In this guide, we are using servers from Hetzner.

However, if you're using a different hosting provider, you can still follow this guide with their servers as well.

If you prefer watching a video instead of reading, you can check out the [tutorial video](https://youtu.be/OnHLO2Plt2E?si=yDM77oK7Xd5UsRSP)
:::

## What Youâ€™ll Need

Before you start, make sure you have:

* A [GitHub account](https://github.com?utm_source=coolify.io) to host your code.
* A [Hetzner account](https://coolify.io/hetzner) to provision your server (or an account with any other hosting provider).
* The [Webstudio CLI](https://docs.webstudio.is/university/self-hosting/cli?utm_source=coolify.io) installed locally to manage your project exports.

## 1. Create Your GitHub Repository

Start by [creating a new repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository) on GitHub where youâ€™ll store your Webstudio project code.

Once the repository is created, [clone the repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) to your local machine to start developing locally.

## 2. Export Your Webstudio Project

Using the Webstudio [CLI](https://docs.webstudio.is/university/self-hosting/cli), export your project and select the "**Docker**" option.

This prepares your project for deployment via Coolify without the need for additional dependency installations.

## 3. Push Your Code to GitHub

With your project exported locally, [push your code](https://docs.github.com/en/get-started/using-git/pushing-commits-to-a-remote-repository) to the GitHub repository you created. This makes your project accessible for deployment.

## 4. Set Up Your Hetzner Server

::: warning HEADS UP!
If you already have a server, you don't need to purchase a new one.

**Webstudio recommends** that your server should have at least **1 CPU and 2GB of RAM** for smooth operation.

Skip to [Step 6](#_6-configure-your-project-on-coolify) if your server is already connected to Coolify.
:::
Follow these steps to prepare your Hetzner server:

1. **Create a New Server:** Log into [Hetzner Cloud Dashboard](https://console.hetzner.cloud/) and create a new server.


2. **Choose Your Region:** Select the region that best suits your needs.


3. **Select Ubuntu:** Pick an Ubuntu image (make sure itâ€™s a Docker-supported version, check the [Docker Ubuntu requirements](https://docs.docker.com/engine/install/ubuntu/#os-requirements)).


4. **Configure Resources:** A shared CPU with at least 2 GB RAM is recommended.


5. **Allocate an IPv4 Address:** Make sure your server has a dedicated IPv4 address.


6. **Finalize Setup:** Click **Create and Buy Now** and wait until your server is provisioned.

7. **Save the IP:** Copy your serverâ€™s IPv4 address, it will be needed shortly.

## 5. Connect Coolify to Your Server

::: warning HEADS UP!
If your server is already connected to Coolify, skip to the [next step](#_6-configure-your-project-on-coolify).
:::

1. **Add Private Key:** Login to your Coolify account (or create one if youâ€™re new) and Add a new private key




2. **Add a Server:** Navigate to the **Servers** tab and add a new server by entering your Hetzner serverâ€™s IPv4 address.




3. **Validate Server:** Click **Validate Server & Install Docker Engine**. Coolify will automatically install all necessary components on your server.


4. **Check Status:** Once finished, you should see a green **Proxy Running** status indicating everything is set up.


## 6. Configure Your Project on Coolify

1. **Create a New Project:** Head to the **Projects** section and create a new project.

2. **Add a Resource:** Add a new resource, selecting your GitHub repository as the source.

3. **Connect Your Repository:** Use the GitHub app integration to grant access to your repository.


4. **Select Build Pack:** Change the Build Pack to **Dockerfile** and click on continue button.


5. **Configure Domains & Deploy:** Enter your domain in the domains field and Click **Deploy** and wait as Coolify builds and deploys your project.


6. **Successful Deployment:** When deployment is complete, youâ€™ll see a â€œDeployment is Finishedâ€ message.

7. **Access Your Site:** Use the **links** button at the top of the project dashboard to visit your live site.


8. **Optional â€“ Third-Party Domains:** If your project loads images from external sources, add those domains as a comma-separated list under the environment variable `DOMAINS`. (make sure to restart the application after adding the variable)


## 7. Update Your Webstudio Site

To publish updates and keep your site up to date, follow these steps:

1. **Publish Changes:** In the Webstudio builder, click **Publish** to generate the latest build data.
2. **Sync and Build:** Run the following commands in your terminal:
   ```bash
   webstudio sync
   webstudio build --template docker
   ```
3. **Push Updates:** Commit and push your changes to GitHub. Coolify will detect the update and automatically trigger a new deployment.

Now youâ€™re all set!

---

---
url: /docs/knowledge-base/destinations.md
description: >-
  Manage Docker network destinations in Coolify for isolated deployment
  environments supporting standalone Docker and Swarm cluster configurations.
---

# Destinations

Destinations in Coolify are **Docker network endpoints** where your applications, databases, and services are deployed. They represent isolated network environments on your servers that provide containerized isolation and networking for your resources.

## What are Destinations?

A destination is essentially a [Docker network](https://docs.docker.com/engine/network/) that acts as a deployment target for your resources. When you deploy an application or database, it gets deployed to a specific destination (Docker network) on a server, providing network isolation and organization for your containerized workloads.

## Types of Destinations

Coolify differentiates destinations between two types based on the server configuration:

### 1. Standalone Docker

* **Purpose**: For single-server deployments
* **Use Case**: Most common setup for individual servers
* **Network Type**: [Docker bridge](https://docs.docker.com/engine/network/drivers/bridge/) or custom networks

### 2. Docker Swarm

* **Purpose**: For [Docker Swarm](https://docs.docker.com/engine/swarm/) cluster deployments
* **Use Case**: Multi-node cluster environments
* **Network Type**: [Docker overlay networks](https://docs.docker.com/engine/network/drivers/overlay/)

## Key Concepts

### Network Isolation

Each destination provides network isolation between different deployments. Applications deployed to different destinations cannot communicate with each other unless explicitly configured.

### Server Relationship

* Each destination belongs to exactly one server
* A server can have multiple destinations
* Destinations are tied to the server's Docker daemon

### Resource Assignment

Destinations can host multiple types of resources:

* **Applications** (web apps, APIs, microservices)
* **Databases** (PostgreSQL, MySQL, Redis, MongoDB, etc.)
* **Services** (one-click deployments like WordPress, Ghost, etc.)

## Benefits

1. **Isolation**: Network-level separation between different projects or environments
2. **Organization**: Logical grouping of related applications and databases
3. **Security**: Prevents unauthorized network access between different deployments
4. **Flexibility**: Ability to deploy the same application to multiple destinations/servers
5. **Scalability**: Support for multi-server deployments through additional destinations

## Related Topics

* [Creating Destinations](./create.md)
* [Managing Destinations](./manage.md)

---

---
url: /docs/services/directus.md
description: >-
  Deploy Directus headless CMS on Coolify with SQL database wrapper,
  REST/GraphQL API, no-code data studio, and custom field types for any project.
---

![directus](https://user-images.githubusercontent.com/522079/158864859-0fbeae62-9d7a-4619-b35e-f8fa5f68e0c8.png)

## What is Directus?

Directus is a real-time API and App dashboard for managing SQL database content.

* **Open Source.** No artificial limitations, vendor lock-in, or hidden paywalls.
* **REST & GraphQL API.** Instantly layers a blazingly fast Node.js API on top of any SQL database.
* **Manage Pure SQL.** Works with new or existing SQL databases, no migration required.
* **Choose your Database.** Supports PostgreSQL, MySQL, SQLite, OracleDB, CockroachDB, MariaDB, and MS-SQL.
* **On-Prem or Cloud.** Run locally, install on-premises, or use our
  [self-service Cloud service](https://directus.io/pricing?utm_source=coolify.io).
* **Completely Extensible.** Built to white-label, it is easy to customize our modular platform.
* **A Modern Dashboard.** Our no-code Vue.js app is safe and intuitive for non-technical users, no training required.

## Deployment Variants

Directus is available in two deployment configurations in Coolify:

### Directus (Default)

* **Database:** SQLite3 (file-based)
* **Use case:** Development, testing, or small-scale deployments
* **Components:** Single Directus container with embedded SQLite database

### Directus with PostgreSQL

* **Database:** PostgreSQL + Redis
* **Use case:** Production deployments requiring better performance, scalability, and caching
* **Components:**
  * Directus container
  * PostgreSQL 16 container
  * Redis 7 container for caching
  * Automatic database configuration and health checks

## Community Help

[The Directus Documentation](https://docs.directus.io?utm_source=coolify.io) is a great place to start, or explore these other channels:

* [Discord](https://directus.chat?utm_source=coolify.io) (Questions, Live Discussions)
* [GitHub Issues](https://github.com/directus/directus/issues?utm_source=coolify.io) (Report Bugs)
* [GitHub Discussions](https://github.com/directus/directus/discussions?utm_source=coolify.io) (Feature Requests)
* [Twitter](https://twitter.com/directus?utm_source=coolify.io) (Latest News)
* [YouTube](https://www.youtube.com/c/DirectusVideos/featured?utm_source=coolify.io) (Video Tutorials)

## Links

* [The official website](https://directus.io?utm_source=coolify.io)
* [GitHub](https://github.com/directus/directus?utm_source=coolify.io)

---

---
url: /docs/troubleshoot/dashboard/disable-2fa-manually.md
description: >-
  Manually disable two-factor authentication in Coolify using SSH, Docker exec,
  and Laravel Tinker commands when you've lost your 2FA device or codes.
---

# Disable 2FA Manually

If you have lost your 2FA device or have any other issues, you can disable 2FA manually if you have access to your server.

## 1. Login to your server through SSH

```bash
ssh your-server-ip
```

## 2. Run the following command to go into coolify container

```bash
docker exec -it coolify sh
```

## 3. Go into Tinker

```bash
php artisan tinker
```

## 4. Find your user id

> In case of `root` user, you must use `0` as user id.

> So `$user_id = 0`;

> For every other user, use the below command to get the user id.

```php
$user_id = User::whereEmail('your-email')->first()->id;
```

## 5. Disable 2FA

```php
User::find($user_id)->update([
  'two_factor_secret' => null,
  'two_factor_recovery_codes' => null,
  'two_factor_confirmed_at' => null
]);
```

---

---
url: /docs/services/diun.md
description: >-
  Monitor Docker images on Coolify with Diun for automatic update notifications,
  registry tracking, and container version management alerts.
---

## What is Diun?

Docker Image Update Notifier is a CLI application written in Go and delivered as a single executable (and a Docker image) to receive notifications when a Docker image is updated on a Docker registry.

## Links

* [The official website](https://crazymax.dev/diun/?utm_source=coolify.io)
* [GitHub](https://github.com/crazy-max/diun?utm_source=coolify.io)

---

---
url: /docs/applications/django.md
description: >-
  Deploy Django applications on Coolify with gunicorn, automatic builds,
  environment variables, and Python package management.
---

# Django

Django is a high-level Python Web framework that encourages rapid development and clean, pragmatic design.

## Requirements

1. Set the base directory where your `requirements.txt` and `manage.py` files are located.

> In the example repository, it is `/coolify`.

2. Add `gunicorn` to the `requirements.txt` file, [official docs](https://docs.gunicorn.org/en/stable/install.html).
3. Add `localhost` and your `domain` to `ALLOWED_HOSTS` in `settings.py` file, [ official docs](https://docs.djangoproject.com/en/4.2/ref/settings/#allowed-hosts).

> `Localhost` is required for health checks to work properly.

---

---
url: /docs/knowledge-base/dns-configuration.md
description: >-
  Configure A records, wildcard domains, and autogenerated subdomains for
  Coolify applications with DNS setup examples and preview deployments.
---

# DNS Configuration

In general you need an `A` record for all the domains or subdomains you want to use, pointing to the IP address of your server where you would like to deploy your application.

Note that you can use the same IP address for multiple domains and subdomains.

**In the examples, `1.1.1.1` is your server's IP address.**

## Single Domain

Let's say you want deploy your resource to `example.com` with the IP address `1.1.1.1`.

* You need to set an `A` record for `example.com` pointing to `1.1.1.1`.

::: success Tip
You can also add `www.example.com` as an `A` record and redirect it inside Coolify with the chosen reverse proxy.
:::

Then you can use `https://example.com` as a FQDN (Fully Qualified Domain Name) for any of your resources, even for your Coolify instance.

## Wildcard Domains

Let's say you want deploy your resource to `*.example.com` with the IP address `1.1.1.1`.

* You need to set an `A` record for `*.example.com` pointing to `1.1.1.1`.

This allows you to use any subdomain of `example.com` as a FQDN (Fully Qualified Domain Name) for any of your resources, even for your Coolify instance.

For example, you can use `https://app.example.com` or `https://api.example.com` as a FQDN.

## Autogenerated Domains

If you set a wildcard domain in your DNS settings, you can also use Coolify to autogenerate domains for your resources.
You just need to go to the `Server` settings and set the `Wildcard Domain` field to your domain, for example `https://example.com`.

Then if you create a new resource:

* You will get a random subdomain for your application, for example `https://random.example.com`.
* Also for your Preview Deployments, for example `https://<PRId>.random.example.com`.

::: success Tip
The Preview URL template could be modified in the application's page /  `Preview Deployments` tab.
:::

## Instance Domain

If you self-host Coolify, you can set your Coolify instance a custom domain in the `/settings` page.

---

---
url: /docs/knowledge-base/docker/compose.md
description: >-
  Deploy multi-container Docker Compose stacks in Coolify with magic environment
  variables, persistent storage, healthchecks, and predefined network
  connections.
---

# Docker Compose

If you are using `Docker Compose` based deployments, you need to understand how Docker Compose works with Coolify.

In all cases the Docker Compose (`docker-compose.y[a]ml`) file is the single source of truth.
This means various settings you would normally configure in the Coolify UI (like environment variables, storage, etc.) need to be defined in the compose file itself.

## Making services available to the outside world

When Coolify deploys a Docker Compose, it creates a network for the services in the deployment. In addition, it adds the proxy service so that it can make services available from within the new network.

That means that there are a few ways to make your services available:

### Domains

Once Coolify loads your compose file, it finds a list of services and allows you to assign a domain. If your services listen on port 80, assigning a domain is enough for the proxy to find and route traffic to them. If they're listening on other ports, add that port to the domain.

For example, if your app is listening on (container) port 80, and you want to run it on `example.com`, enter `http://example.com` (or `https://`) for the domain.

If your app is listening on (container) port 3000, however, you'll enter `http://example.com:3000` in the relevant service. The port here only tells Coolify where to send traffic within the container; the proxy will make this service available on the normal port (`http://example.com` port 80, in this case.)

If you want to customize this domain-based routing further, see [Coolify's magic environment variables](#coolify-s-magic-environment-variables) below.

### Service Port Mapping

If you want to make your service accessible via it's port on the host, add the [ports attribute](https://docs.docker.com/reference/compose-file/services/#ports) in your compose file. For example, to map container port `3000` directly to the host machine:

```yaml
services:
  backend:
    image: your-backend:latest
    ports:
      - "3000:3000"
```

Be aware that if you do this, **your service will be available on your server at port 3000, outside the control of any proxy configuration.** This may not be what you want! If you use the same Docker Compose file for development and deployment, this may expose the ports of private services that you did not intend.

Optionally, you can pass an IP address to bind the port to a specific interface on the host machine:

```yaml
services:
  backend:
    image: your-backend:latest
    ports:
      - "127.0.0.1:3000:3000"
```

This will make your service only available on `localhost:3000` of your server.

### Private or Internal Services

If you don't map a service port or assign a domain, Coolify will not expose your service outside the private network. At that point, you can refer to it as normal for Docker Compose.

For example, if you have two services with these names:

```yaml
services:
  backend:
    image: your-backend:latest
  auth:
    image: your-auth:latest
```

Then you can connect from `backend` to `auth` by referring to it as `http://auth:1234` (or whatever port.) Likewise, `auth` can connect to `backend` by referring to `http://backend:3000` (or whatever port.)

For further details, please refer to the [Docker Networking in Compose](https://docs.docker.com/compose/how-tos/networking/) docs.

## Defining Environment Variables

Coolify automatically detects environment variables mentioned in your compose file and displays them in the UI. For example:

```yaml
services:
  myservice:
    environment:
      - SOME_HARDCODED_VALUE=hello # Gets passed to the container but will not be visible in Coolify's UI
      - SOME_VARIABLE=${SOME_VARIABLE_IN_COOLIFY_UI} # Creates an uninitialized environment variable editable in Coolify's UI
      - SOME_DEFAULT_VARIABLE=${OTHER_NAME_IN_COOLIFY:-hello} # Creates an environment variable of value "hello" editable in Coolify's UI
```

### Required Environment Variables

Coolify supports marking environment variables as required using Docker Compose's built-in syntax. This feature improves the deployment experience by validating critical configuration before starting services.
You can mark environment variables as required using the `:?` syntax. Required variables must be set before deployment and will be highlighted in Coolify's UI with a red border if empty.

```yaml
services:
  myapp:
    environment:
      # Required variables - deployment will fail if not set
      - DATABASE_URL=${DATABASE_URL:?}
      - API_KEY=${API_KEY:?}

      # Required variables with default values - prefilled in UI but can be changed
      - PORT=${PORT:?3000}
      - LOG_LEVEL=${LOG_LEVEL:?info}

      # Optional variables - standard behavior
      - DEBUG=${DEBUG:-false}
      - CACHE_TTL=${CACHE_TTL:-3600}
```

**Key behaviors:**

* **Required variables** (`${VAR:?}`) appear first in the environment variables list and show a red border when empty
* **Required with defaults** (`${VAR:?default}`) are prefilled with the default value but remain editable
* **Optional variables** (`${VAR:-default}`) use standard Docker Compose behavior

If a required variable is not set during deployment:

* Coolify will highlight the missing variable in the UI
* The deployment will be prevented until all required variables are provided
* Clear error messages guide users to fix the configuration

This validation happens before container creation, preventing partial deployments and runtime failures.

### Shared Environment Variables

Coolify doesn't directly detect **shared** environment variables in the compose file, but are able to be referenced using with an additional step.

1. Create your shared variable following the [shared variables documentation](/knowledge-base/environment-variables#shared-variables).

2. Define your variables in your Docker Compose file, for example;

```yaml
services:
  myservice:
    environment:
      - HARD_CODED=dev # Passed to the container, but not visible in Coolify's UI.
      - SOME_OPTIONAL_VARIABLE=${SOME_VARIABLE_IN_COOLIFY_UI} # Creates an editable, uninitialized variable in the UI.
    volumes:
      - data-persist:/var/data
  volumes:
    data-persist:
      device: /mnt/serverstorage/${SOME_VARIABLE_IN_COOLIFY_UI} # Re-uses the variable
```

3. Define the variable explicitly in the applications Environment Variables referencing your shared variable created in step 1;

::: v-pre

If in developer view, you can enter it like so;

```
SOME_VARIABLE_IN_COOLIFY_UI={{environment.SOME_SHARED_VARIABLE}}
```

Or in the normal view, the Name is what's referenced in the Docker Compose file `SOME_VARIABLE_IN_COOLIFY_UI` with the Value being the referenced environment variable `{{environment.SOME_SHARED_VARIABLE}}` as seen below. Once saved if correct, you'll see there's a third text box, if you reveal this, you should be able to see the true value, in this case `SOME_VALUE`.

:::

### Coolify's Magic Environment Variables

Coolify can generate dynamic environment variables for you using the following syntax: `SERVICE_<TYPE>_<IDENTIFIER>`. The type may be one of:

* **URL**: This will [generate](/knowledge-base/server/introduction#wildcard-domain) an URL for the service. The example below shows how you can add paths and ports.
* **FQDN**: Generates FQDN for the service based on the URL you have defined. The example below shows how you can add paths and ports.
* **USER**: Generates a random string using `Str::random(16)`. You might want to use it as a username in your service.
* **PASSWORD**: Generates a password using `Str::password(symbols: false)`. Use `PASSWORD_64` to generate a 64 bit long password with `Str::password(length: 64, symbols: false)`.
* **BASE64**: Generates a random string using `Str::random(32)`. For longer strings, use `BASE64_64` or `BASE64_128`.

::: info Identifier Naming
Identifier with underscores (`_`) cannot use ports in environment variables. Use hyphens (`-`) instead to avoid this limitation.

```
SERVICE_URL_APPWRITE_SERVICE_3000 âŒ
SERVICE_URL_APPWRITE-SERVICE_3000 âœ…
```

:::

Every generated variable can be reused and will always have the same value for every service.
All generated variables are displayed in Coolify's UI for environment variables and can be edited there (except FQDN and URl).

As an example, imagine an application with UUID `vgsco4o` (generated by Coolify on creation).
It uses a compose file deploying Appwrite on the [wildcard](/knowledge-base/server/introduction#wildcard-domain) domain `http://example.com` .

This will do the following:

```yaml
services:
  appwrite:
    environment:
      # http://appwrite-vgsco4o.example.com
      - SERVICE_URL_APPWRITE
      # http://appwrite-vgsco4o.example.com/v1/realtime
      - SERVICE_URL_APPWRITE=/v1/realtime
      # _APP_URL will have the FQDN because SERVICE_URL_APPWRITE is just a simple environment variable
      - _APP_URL=$SERVICE_URL_APPWRITE
      # http://appwrite-vgsco4o.example.com/ will be proxied to port 3000
      - SERVICE_URL_APPWRITE_3000
      # DOMAIN_URL will have the FQDN (appwrite-vgsco4o.example.com) because SERVICE_FQDN_APPWRITE generates the full FQDN. No need to add 3000 at the end of the variable
      - DOMAIN_NAME=${SERVICE_FQDN_APPWRITE}
      # http://api-vgsco4o.example.com/api will be proxied to port 2000
      - SERVICE_URL_API_2000=/api
      # Coolify generates password and injects it as SERVICE_SPECIFIC_PASSWORD into the container
      - SERVICE_SPECIFIC_PASSWORD=${SERVICE_PASSWORD_APPWRITE}
  not-appwrite:
    environment:
      # Reuses the password from the Appwrite service.
      - APPWRITE_PASSWORD=${SERVICE_PASSWORD_APPWRITE}
      # As SERVICE_URL_API is not the same as SERVICE_URL_APPWRITE
      # Coolify will generate a new URL
      # http://not-appwrite-vgsco4o.example.com/api
      - SERVICE_URL_API=/api
```

::: warning
Support for Magic Environment Variables in Compose files based on Git sources requires Coolify v4.0.0-beta.411 and above.
:::

## Storage

You can predefine storage normally in your compose file, but there are a few extra options that you can set to tell Coolify what to do with the storage.

### Create an empty directory

```yaml
# Predefine directories with host binding
services:
  filebrowser:
    image: filebrowser/filebrowser:latest
    volumes:
      - type: bind
        source: ./srv
        target: /srv
        is_directory: true # This will tell Coolify to create the directory (this is not available in a normal docker-compose)
```

### Create a file with content

Here you can see how to add a file with content and a dynamic value that is coming from an environment variable.

```yaml
services:
  filebrowser:
    image: filebrowser/firebrowser:latest
    environment:
      - POSTGRES_PASSWORD=password
    volumes:
      - type: bind
        source: ./srv/99-roles.sql
        target: /docker-entrypoint-initdb.d/init-scripts/99-roles.sql
        content: |
          -- NOTE: change to your own passwords for production environments
           \set pgpass `echo "$POSTGRES_PASSWORD"`

           ALTER USER authenticator WITH PASSWORD :'pgpass';
           ALTER USER pgbouncer WITH PASSWORD :'pgpass';
```

## Exclude from healthchecks

If you have a service that you do not want to be part of your overall healthchecks, you can exclude it from the healthchecks by setting the `exclude_from_hc` option to `true`.

::: success Tip
This is useful for example if you have a migration service that runs only once and then the container stops.
:::

```yaml
services:
  some-service:
    exclude_from_hc: true
    ...
```

## Connect to Predefined Networks

By default, each compose stack is deployed to a separate network, with the name of your resource uuid. This will allow to each service in your stack to communicate with each other.

But in some cases, you would like to communicate with other resources in your account. For example, you would like to connect your application to a database, which is deployed in another stack.

To do this you need to enable `Connect to Predefined Network` option on your `Service Stack` page, but this will make the internal Docker DNS not work as expected.

Here is an example. You have a stack with a `postgres` database and a `laravel` application. Coolify will rename your `postgres` stack to `postgres-<uuid>` and your `laravel` stack to `laravel-<uuid>` to prevent name collisions.

If you set `Connect to Predefined Network` option on your `laravel` stack, your `laravel` application will be able to connect to your `postgres` database, but you need to use the `postgres-<uuid>` as your database host.

## Raw Docker Compose Deployment

You can set up your project to use docker compose build pack to deploy your compose file directly without most of Coolify's magic. It is called `Raw Compose Deployment`.

::: warning Caution
This is for advanced users. If you are not familiar with Docker Compose, we do not recommend this method.
:::

### Labels

Coolify will still add the following labels (if they are not set) to your application:

```yaml
labels:
  - coolify.managed=true
  - coolify.applicationId=5
  - coolify.type=application
```

To use Coolify's Proxy (Traefik), you need to set the following labels to your application:

```yaml
labels:
  - traefik.enable=true
  - "traefik.http.routers.<unique_router_name>.rule=Host(`coolify.io`) && PathPrefix(`/`)"
  - traefik.http.routers.<unique_router_name>.entryPoints=http
```

---

---
url: /docs/applications/build-packs/docker-compose.md
description: >-
  Deploy multi-container applications with Docker Compose using custom domains,
  magic environment variables, storage volumes, and service networking.
---

Docker Compose lets you deploy multiple Docker containers and configure them easily.

With the Docker Compose build pack, you can use your own Docker Compose file (i.e. `docker-compose.y[a]ml`) as the single source of truth, giving you full control over how your application is built and deployed on Coolify.

## How to use Docker Compose?

### 1. Create a New Resource in Coolify

On the Coolify dashboard, open your project and click the **Create New Resource** button.

### 2. Choose Your Deployment Option

**A.** If your Git repository is public, choose the **Public Repository** option.

**B.** If your repository is private, you can select **Github App** or **Deploy Key**. (These methods require extra configuration. You can check the guides on setting up a [Github App](/applications/ci-cd/github/integration#with-github-app-recommended) or [Deploy Key](/applications/ci-cd/github/integration#with-deploy-keys) if needed.)

### 3. Select Your Git Repository

If you are using a public repository, paste the URL of your GitHub repository when prompted. The steps are very similar for all other options.

### 4. Choose the Build Pack

Coolify defaults to using Nixpacks. Click the Nixpacks option and select **Docker Compose** as your build pack from the dropdown menu.

### 5. Configure the Build Pack

* **Branch:** Coolify will automatically detect the branch in your repository.
* **Base Directory:** Enter the directory that Coolify should use as the root. Use `/` if your files are at the root or specify a subfolder (like `/backend` for a monorepo).
* **Docker Compose Location:** Enter the path to your Docker Compose file, this path is combined with the Base Directory. Make sure the file extension matches exactly, if it doesnâ€™t then Coolify wonâ€™t be able to load it.

Click on **Continue** button once you have set all the above settings to correct details.

## Making services available to the outside world

Read more about [Exposing Services to the Internet](/knowledge-base/compose#exposing-services-to-the-internet) in the Knowledge Base.

## Advanced Configuration

### Using Environment and Shared Variables

Within Coolify you can configure these easily following the details found in the [Knowledge Base for Docker Compose](/knowledge-base/compose#defining-environment-and-shared-variables).

### Storage

You can set up storage in your compose file, with some extra options for Coolify.

#### Create an Empty Directory

Define directories with host binding and inform Coolify to create them:

```yaml
services:
  filebrowser:
    image: filebrowser/filebrowser:latest
    volumes:
      - type: bind
        source: ./srv
        target: /srv
        is_directory: true # Instructs Coolify to create the directory.
```

#### Create a File with Content

Specify a file with predefined content and even include a dynamic value from an environment variable:

```yaml
services:
  filebrowser:
    image: filebrowser/filebrowser:latest
    environment:
      - POSTGRES_PASSWORD=password
    volumes:
      - type: bind
        source: ./srv/99-roles.sql
        target: /docker-entrypoint-initdb.d/init-scripts/99-roles.sql
        content: |
          -- NOTE: Change these passwords for production!
           \set pgpass `echo "$POSTGRES_PASSWORD"`

           ALTER USER authenticator WITH PASSWORD :'pgpass';
           ALTER USER pgbouncer WITH PASSWORD :'pgpass';
```

### Exclude from Healthchecks

If a service should not be part of the overall healthchecks (for example, a one-time migration service), set the `exclude_from_hc` option to `true`:

```yaml
services:
  some-service:
    exclude_from_hc: true
    ...
```

### Connect to Predefined Networks

By default, each compose stack is deployed to a separate network named after your resource UUID. This setup allows each service in the stack to communicate with one another.

If you want to connect services across different stacks (for example, linking an application to a separate database), enable the **Connect to Predefined Network** option on your Service Stack page.

Note that you must use the full name (like `postgres-<uuid>`) when referencing a service in another stack.

### Raw Docker Compose Deployment

For advanced users, Coolify offers a "Raw Compose Deployment" mode. This option lets you deploy your Docker Compose file directly without many of Coolify's additional configurations.

::: danger CAUTION
This mode is intended for advanced users familiar with Docker Compose.
:::

### Labels

Coolify automatically adds these labels to your application (if not already set):

```yaml
labels:
  - coolify.managed=true
  - coolify.applicationId=5
  - coolify.type=application
```

To enable Coolify's Proxy (Traefik), also include these labels:

```yaml
labels:
  - traefik.enable=true
  - "traefik.http.routers.<unique_router_name>.rule=Host(`shadowarcanist.com`) && PathPrefix(`/`)"
  - traefik.http.routers.<unique_router_name>.entryPoints=http
```

### Build Arguments

When building images with Docker Compose, Coolify can inject build arguments into your build process. You can configure these settings in the **Advanced** menu of your application.

#### Inject Build Args to Dockerfile

Controls whether Coolify automatically injects build arguments during the build. Disable this in the Advanced menu if you want full control over build arguments in your Dockerfile.

* **Enabled (default):** Coolify automatically injects build arguments
* **Disabled:** You manage `ARG` statements yourself in the Dockerfile

#### Include Source Commit in Build

Controls whether the `SOURCE_COMMIT` variable (Git commit hash) is included in builds. Disabled by default to preserve Docker's build cache between commits. You can enable this in the Advanced menu if your build process requires the commit hash.

* **Disabled (default):** `SOURCE_COMMIT` is not included, improving cache utilization
* **Enabled:** `SOURCE_COMMIT` is included as a build argument

::: warning Build Cache Optimization
If build cache is not being preserved between deployments, ensure "Include Source Commit in Build" is disabled. The `SOURCE_COMMIT` value changes with every commit and will invalidate the cache.
:::

## Known Issues and Solutions

::: details 1. Visiting the Application Domain Shows "No Available Server"
If you see a "No Available Server" error when visiting your website, it is likely due to the health check for your container.

Run `docker ps` on your server terminal to check if your container is unhealthy or still starting.

To resolve this, fix the issue causing the container to be unhealthy or remove the health checks.
:::

---

---
url: /docs/troubleshoot/installation/docker-install-failed.md
description: >-
  Fix Docker installation failures during Coolify setup by using Ubuntu LTS
  versions or manually installing Docker 24+ on non-LTS operating systems.
---

# Docker Installation Failed

If the Coolify install script fails at the **â€œInstalling Dockerâ€** step, itâ€™s most often due to the server running a **non-LTS version of the operating system** â€” especially common on **Ubuntu** systems.

## Symptoms

Coolify install script fails with an error like:

```sh
ERROR: '27.0' not found amongst apt-cache madison results
```

## Solution

* Manually Install Docker
  * Follow the official [Docker installation guide](https://docs.docker.com/engine/install/#server) to manually install Docker (version **24+**)

OR

* Use an LTS Version of Your OS
  * Switch to a **Long-Term Support (LTS)** version of your operating system, such as **Ubuntu 22.04 LTS** or  **Debian 12**

---

---
url: /docs/knowledge-base/docker/registry.md
description: >-
  Push built Docker images to any registry with Coolify including custom tags,
  authentication setup, Swarm mode support, and self-hosted registry
  configuration.
---

# Docker Registry

You can easily push your built docker images to any docker registries with Coolify.

You just need to fill the `Docker Registry` fields in your service `General` configurations.

## Configuration

### Docker Image

If this field is set, Coolify will automatically push your built docker image to the specified docker registry.

> If the image is empty, Coolify won't push your built image.

### Docker Image Tag

If this field is set, Coolify will automatically push your built docker image with the specified tag to the specified docker registry + the git commit sha tag.

> If the tag is empty, Coolify only push your built image with the git commit sha tag.

## Docker Credentials

Docker credentials (from v4.0.0-beta.88) are used to authenticate with Docker registries to pull/push images.

If you want to authenticate Coolify with a Docker Registry:

1. Login to your server
   Login on the server through SSH with the same user that configured for your server.

2. Authenticate to Docker Registry
   Login to the Docker Registry, normally execute `docker login` command.

   > You will be prompted to enter your Docker registry username and password/token - this can be varied depending on the Docker registry you are using.

Once you logged in, Coolify will automatically detect your credentials and use them.

## Swarm Mode

If you are deploying to a Swarm cluster, you need to make sure that your Docker Registry is accessible from all nodes in the cluster, workers and managers.

## Host your own registry

You can easily host your own registry, however, it will consume a lot of storages as by default it stores images locally on the server.

More info on how to set other storage drivers can be found in the [official documentation](https://distribution.github.io/distribution/storage-drivers/).

You can find the one-click service in Coolify.

### Setup

You need to generate an user / password for the registry.

You can generate one with the [htpasswd](https://httpd.apache.org/docs/current/programs/htpasswd.html) command:

```bash
htpasswd -nbB test test
```

Then go to `Storages` menu, and in the `/auth/registry.password` file, simply add the generated user / password. One line per user.

::: warning Caution
Do not forget to restart the registry service.
:::

---

---
url: /docs/services/docker-registry.md
description: >-
  Host private Docker registry on Coolify for container image storage,
  distribution, versioning, and secure artifact management for DevOps teams.
---

![Docker Registry](https://raw.githubusercontent.com/distribution/distribution/main/distribution-logo.svg)

## What is Docker Registry?

Docker Registry is a stateless, highly-available server side application that stores and distributes Docker images.

## Links

* [The official website](https://hub.docker.com?utm_source=coolify.io)
* [GitHub](https://github.com/docker/distribution?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/docker/swarm.md
description: >-
  Deploy Coolify resources across Docker Swarm clusters with external registry
  requirements, manager and worker setup, and persistent storage configuration.
---

# Docker Swarm

::: danger Caution
***This is an experimental feature.***
:::

## Setup in Coolify

If you would like to use a Swarm to deploy your resources, you need to add the `Swarm Manager` to Coolify.

Optionally, you can add the `Swarm Workers` to Coolify. This will allow Coolify to do cleanups and other stuff on the `Swarm Workers`.

### Docker Registry

You need to have an external Docker Registry available to use a Swarm, as all workers need to be able to pull the images you built with Coolify.

* The Swarm Manager needs to push the image to the Docker Registry.
* The Swarm Workers need to pull the image from the Docker Registry.

So set your docker login credentials accordingly. More information [here](/knowledge-base/docker/registry).

## Install Swarm Cluster

> WIP
> This is just a brief guide to install a simple Docker Swarm cluster. For more information, please refer to the [official documentation](https://docs.docker.com/engine/swarm/).

### Prerequisites

* I will use [Hetzner](https://coolify.io/hetzner) (referral link) for this guide. You can use any other provider.
* You need at least 3 servers to create a Docker Swarm cluster with the same architecture (ARM or AMD64).
* 1 server for the manager node.
* 2 servers for the worker nodes (you can add more worker nodes if you want).
* Add private networking to all servers if possible.

### Install Docker

Install Docker on all servers. You can follow the [official documentation](https://docs.docker.com/engine/install/) or:

1. Install with Rancher script

```bash
curl https://releases.rancher.com/install-docker/24.0.sh | sh
```

2. Install with Docker script

```bash
curl https://get.docker.com | sh -s -- --version 24.0
```

> You only need to use one of the above commands.

### Configure Docker

On `all servers`, run the following command to start Docker.

```bash
systemctl start docker
systemctl enable docker
```

::: warning Caution
Hetzner specific configuration. Hetnzer servers use a MTU of 1450. You need to configure Docker to use the same MTU.

On the `manager`, run the following command to configure Docker.

```bash
mkdir -p /etc/docker
cat <<EOF > /etc/docker/daemon.json
{
  "default-network-opts": {
    "overlay": {
      "com.docker.network.driver.mtu": "1450"
    }
  }
}
EOF
systemctl restart docker
```

:::

### Create a Swarm cluster

`On the manager node`, run the following command to create a new cluster.

```bash
# MANAGER_IP = IP of the manager node. If you have private networking, use the private IP, like 10.0.0.x.
docker swarm init --advertise-addr <MANAGER_IP>

```

This command will output a command to join the cluster on the `worker nodes`.

It should look like something like this:

```bash
# DO NOT RUN THIS COMMAND, IT IS JUST AN EXAMPLE, HELLO!
docker swarm join --token SWMTKN-1-24zvxeydjarchy7z68mdawichvf684qvf8zalx3rmwfgi6pzm3-4ftqn9n8v98kx3phfqjimtkzx 10.0.0.2:2377
```

### Verify the cluster

Run the following command on the manager node to verify the cluster.

```bash
docker node ls
```

You should see something like this:

```bash
ID                            HOSTNAME        STATUS    AVAILABILITY   MANAGER STATUS   ENGINE VERSION
ua38ijktbid70em257ymxufif *   swarm-manager   Ready     Active         Leader           24.0.2
7rss9rvaqpe9fddt5ol1xucmu     swarm-worker    Ready     Active                          24.0.2
12239rvaqp43gddtgfsdxucm2     swarm-worker    Ready     Active                          24.0.2

```

## Deploy with persistent storage

To be able to deploy a service with persistent storage, you need to have a shared volume on the `swarm-workers`. So the Swarm service could move the resources between the `swarm-workers`.

You can always use services like AWS EFS, NFS, GlusterFS, etc.

> WIP

---

---
url: /docs/applications/build-packs/dockerfile.md
description: >-
  Build Docker images from your custom Dockerfile with Coolify supporting Git
  repositories, environment variables, and pre/post-deployment commands.
---

Dockerfile includes step-by-step instructions to build a Docker image that Coolify uses to deploy your application or website.

The Dockerfile build pack allows you to use your own Dockerfile to deploy your application, you have complete control over how your application is built and deployed on Coolify.

## How to use Dockerfile?

### 1. Create a New Resource in Coolify

On the Coolify dashboard, open your project and click the **Create New Resource** button.

### 2. Choose Your Deployment Option

**A.** If your Git repository is public, choose the **Public Repository** option.

**B.** If your repository is private, you can select **Github App** or **Deploy Key**. (These methods require extra configuration. You can check the guides on setting up a [Github App](/applications/ci-cd/github/integration#with-github-app-recommended) or [Deploy Key](/applications/ci-cd/github/integration#with-deploy-keys) if needed.)

### 3. Select Your Git Repository

If you are using a public repository, paste the URL of your GitHub repository when prompted. The steps are very similar for all other options.

### 4. Choose the Build Pack

Coolify defaults to using Nixpacks. Click the Nixpacks option and select **Dockerfile** as your build pack from the dropdown menu.

### 5. Configure the Build Pack

* **Branch:** Coolify will automatically detect the branch in your repository.
* **Base Directory:** Enter the directory that Coolify should use as the root. Use `/` if your files are at the root or specify a subfolder (like `/backend` for a monorepo).

Click on **Continue** button once you have set all the above settings to correct details.

### 6. Configure Network Settings

After clicking **Continue**, update settings like your domain and environment variables (if needed).

The important option is the port where your application runs.
Coolify sets the default port to 3000, so if your application listens on a different port, update the port number on the network section.

## Advanced Configuration

### Environment Variables

You can manage your environment variables from the Coolify UI.

Click on the **Environment Variables** tab to add or update them.

### Pre/Post Deployment Commands

### Build Arguments

Coolify automatically injects build arguments into your Dockerfile during the build process. These include environment variables you've configured and predefined system values like `SOURCE_COMMIT`.

You can configure these settings in the **Advanced** menu of your application.

#### Inject Build Args to Dockerfile

By default, Coolify injects Docker build arguments (`ARG` statements) into your Dockerfile. If you prefer to manage build arguments manually in your Dockerfile, you can disable this behavior in the Advanced menu.

* **Enabled (default):** Coolify automatically injects build arguments
* **Disabled:** You manage `ARG` statements yourself in the Dockerfile

#### Include Source Commit in Build

The `SOURCE_COMMIT` variable contains the Git commit hash of your source code. By default, this is excluded from the build to preserve Docker's build cache. You can enable this in the Advanced menu if needed.

* **Disabled (default):** `SOURCE_COMMIT` is not included, improving cache utilization
* **Enabled:** `SOURCE_COMMIT` is included as a build argument

::: warning Build Cache Optimization
Enabling "Include Source Commit in Build" will cause Docker's build cache to be invalidated on every commit, since the commit hash changes each time. Only enable this if your build process requires the commit hash.
:::

## Known Issues and Solutions

::: details 1. Visiting the Application Domain Shows "No Available Server"
If you see a "No Available Server" error when visiting your website, it is likely due to the health check for your container.

Run `docker ps` on your server terminal to check if your container is unhealthy or still starting.

To resolve this, fix the issue causing the container to be unhealthy or remove the health checks.
:::

::: details 2. App only works inside the Container
If your app works when you check it with a `curl localhost` inside the container but you receive a 404 or "No Available Server" error when accessing your domain, verify the port settings.

Make sure that the port in the network settings matches the port where your application is listening. Also, check the startup log to ensure the application is not only listening on localhost.

If needed, change it to listen on all interfaces (for example, `0.0.0.0`).
:::

---

---
url: /docs/services/docmost.md
description: >-
  Deploy Docmost wiki on Coolify for team documentation, knowledge management,
  real-time collaboration, and organized information sharing platform.
---

# What is Docmost?

Docmost is an open-source collaborative wiki and documentation software.

## Screenshots

![Docmost editor](https://docmost.com/screenshots/editor.png)

![Docmost editor 2](https://docmost.com/screenshots/editor2.png)

![Docmost home](https://docmost.com/screenshots/home.png)

## Links

* [The official website](https://www.docmost.com?utm_source=coolify.io)
* [GitHub](https://github.com/docmost/docmost?utm_source=coolify.io)

---

---
url: /docs/services/documenso.md
description: >-
  Run Documenso document signing on Coolify as open-source DocuSign alternative
  with e-signatures, PDF workflows, and digital signature management.
---

# Documenso

## What is Documenso

Document signing, finally open source

## Links

* [Official Documentation](https://docs.documenso.com/?utm_source=coolify.io)

---

---
url: /docs/services/docuseal.md
description: >-
  Host DocuSeal on Coolify for PDF form filling, e-signatures, document
  workflows, and digital signature collection for business process automation.
---

## What is Docuseal?

Document Signing for Everyone free forever for individuals, extensible for businesses and developers. Open Source Alternative to DocuSign, PandaDoc and more.

## Deployment Variants

DocuSeal is available in two deployment configurations in Coolify:

### DocuSeal (Default)

* **Database:** SQLite (embedded)
* **Use case:** Simple deployments, testing, or low-volume document signing
* **Components:** Single DocuSeal container with built-in SQLite database

### DocuSeal with PostgreSQL

* **Database:** PostgreSQL
* **Use case:** Production deployments requiring better performance, scalability, and concurrent access
* **Components:**
  * DocuSeal container
  * PostgreSQL container
  * Automatic database configuration and health checks

## Screenshots

## Links

* [The official website](https://www.docuseal.co?utm_source=coolify.io)
* [GitHub](https://github.com/docusealco/docuseal?utm_source=coolify.io)

---

---
url: /docs/services/dokuwiki.md
description: >-
  Deploy DokuWiki on Coolify for flat-file wiki without database, version
  control, ACL permissions, and plugin extensibility for documentation.
---

![DokuWiki](https://www.dokuwiki.org/lib/tpl/dokuwiki/images/logo.png)

## What is DokuWiki?

DokuWiki is a simple to use and highly versatile Open Source wiki software that doesn't require a database. It is loved by users for its clean and readable syntax. The ease of maintenance, backup and integration makes it an administrator's favorite. Built in access controls and authentication connectors make DokuWiki especially useful in the enterprise context and the large number of plugins contributed by its vibrant community allow for a broad range of use cases beyond a traditional wiki.

## Why DokuWiki?

DokuWiki is a popular choice when choosing a Wiki software and has many advantages over similar software.

* Easy to install and use
* Low system requirements
* Built-in Access Control Lists
* Large variety of extensions
* Over 50 languages supported
* Device independent
* Open Source

## Use Cases

DokuWiki are quick to update and new pages are easily added. Designed for collaboration while maintaining a history of every change, DokuWiki could be used as:

* Corporate Knowledge Base
* Private notebook
* Software manual
* Project workspace
* CMS â€“ intranet

## Links

* [The official website](https://www.dokuwiki.org?utm_source=coolify.io)
* [GitHub](https://github.com/splitbrain/DokuWiki?utm_source=coolify.io)

---

---
url: /docs/services/dolibarr.md
description: >-
  Run Dolibarr ERP/CRM on Coolify with invoicing, inventory, projects, HR
  management, and business process automation for small to medium enterprises.
---

# Dolibarr

## What is Dolibarr

Dolibarr is a modern software package to manage your organization's activity (contacts, quotes, invoices, orders, stocks, agenda, hr, expense reports, accountancy, ecm, manufacturing, ...).

## Links

* [Official Documentation](https://www.dolibarr.org/documentation-home.php?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/domains.md
description: >-
  Add custom domains to Coolify with FQDN format, multiple domain support, port
  mapping, wildcard domains, and custom DNS server validation.
---

# Domains

You can easily add your own domains to Coolify or your resources.

All domain fields are capable to generate your proxy configurations based on the following rules:

1. You need to use FQDN (Fully Qualified Domain Name) format: `https://coolify.io`
2. You can give multiple domains, separated by comma: `https://coolify.io,https://www.coolify.io`
3. You can also add a port to the domain, so the proxy will know which port you would like to map to the domain: `https://coolify.io:8080,http://api.coolify.io:3000`

## HTTPS & SSL Certificates

Coolify automatically handles SSL/TLS certificates for your applications. When you enter a domain with the `https://` protocol, everything is configured for you behind the scenes.

### How Automatic HTTPS Works

When you enter a domain using the `https://` protocol (for example, `https://example.com`):

1. **Automatic Proxy Configuration** - Coolify automatically applies the necessary configuration to your reverse proxy (Traefik or Caddy) to serve your application over HTTPS.

2. **Certificate Issuance** - The proxy automatically starts the process to request and install SSL certificates from [Let's Encrypt](https://letsencrypt.org?utm_source=coolify.io).

3. **Automatic Renewal** - Certificates are automatically renewed before they expire. Let's Encrypt certificates are valid for 90 days and Coolify handles renewals seamlessly.

::: success TIP
You don't need to do anything special to enable HTTPS. Simply use `https://` when entering your domain, and Coolify takes care of the rest.
:::

### Self-Signed Certificates

If automatic certificate issuance from [Let's Encrypt](https://letsencrypt.org?utm_source=coolify.io) fails, the Coolify Proxy will provide a self-signed certificate to keep your application accessible. This means your application will still be reachable, but browsers will show a security warning.

::: warning TROUBLESHOOTING
If you see a certificate warning in your browser or your application shows a self-signed certificate, see the [Let's Encrypt Not Working](/troubleshoot/dns-and-domains/lets-encrypt-not-working) troubleshooting guide for detailed solutions.
:::

## Catch Multiple Domains

Multitenancy is supported with Coolify. When using [Traefik](/knowledge-base/proxy/traefik/overview), you can automatically catch multiple domains, by editing the `Container Labels` of your Application or Service and define a [`HostRegexp`](https://doc.traefik.io/traefik/reference/routing-configuration/http/routing/rules-and-priority/#host-and-hostregexp) rule.

::: warning Catch-All & SSL Certificates
The Coolify Proxy won't be able to issue SSL certificates for catch-all domains. For subdomains of a specific domain, you have the option to generate a [Wildcard SSL certificate](/knowledge-base/proxy/traefik/wildcard-certs).
:::

## Wildcard Domain

You can set a wildcard domain (`example: http://example.com`) to your server, so you can easily assign generated domains to all the resources connected to this server. [More details](/knowledge-base/server/introduction#wildcard-domain)

## DNS Validation

Since version `beta.191`, Coolify will validates DNS records for your domains with `1.1.1.1` Cloudflare DNS server.

If you want to use different DNS server, go to your `Settings > Advanced` page and change the `Custom DNS Servers` field (comma separated list).

---

---
url: /docs/get-started/downgrade.md
description: >-
  Downgrade self-hosted Coolify to previous versions by disabling auto-update,
  using SSH terminal commands, and handling database compatibility risks.
---

If you're using [Coolify Cloud](https://coolify.io/pricing/), the Coolify team handles all updates so you **cannot** downgrade the version of Coolify. If you are facing any issues, please contact [support](/get-started/support).

For those who **self-host** Coolify, you can easily downgrade to the previous version. Follow the steps below to perform a downgrade on to a previous version.

:::danger **Backup First!**

> **Always back up your Coolify data before performing an downgrade.** > **Downgrading can introduce issues that can be difficult to fix.**
> :::

The Downgrade process involves the following three steps:

* [Disable Auto Update](#_1-disable-auto-update)
* [Login to Your Server via SSH](#_2-login-to-your-server-via-ssh)
* [Execute the Downgrade Command](#_3-execute-the-downgrade-command)

## 1. Disable Auto Update

Before downgrading, it's important to disable the Auto Update feature to prevent Coolify from automatically upgrading again after you perform the downgrade.

1. Log in as the root user (or any user who has access to the root or initial team).

2. Navigate to the Settings menu in your Coolify dashboard.

3. In the Settings menu, disable the **Auto Update** feature.

::: warning Important!
Disabling auto-update is essential, as it ensures that Coolify doesnâ€™t override your downgrade with a newer version.
:::

## 2. Login to Your Server via SSH

Next, you need to SSH into your server to execute the downgrade command.

## 3. Execute the Downgrade Command

To downgrade Coolify to the desired version, run the following command in your terminal:

```sh
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash -s 4.0.0-beta.369
```

Replace `4.0.0-beta.369` with the version number you want to downgrade to.

For example, you can downgrade to `4.0.0-beta.333` or any previous version.

::: warning Note
Double-check the version number you are specifying to ensure you are downgrading to the correct version. You can check the Coolify [release notes](https://github.com/coollabsio/coolify/releases) for version details.
:::

## Potential Issues with Downgrading

While downgrading is possible, be aware of the following risks:

* [Database Schema Compatibility](#database-schema-compatibility)
* [Feature Incompatibility](#feature-incompatibility)

***

#### Database Schema Compatibility:

Downgrading can cause issues since the database schema may not be backward compatible. Some features may not work as expected due to changes in the database structure between versions.

#### Feature Incompatibility:

Some features might not function properly after downgrading, as certain features in the newer version may rely on changes that are not present in the older version.

---

---
url: /docs/services/dozzle.md
description: >-
  Monitor Docker logs on Coolify with Dozzle real-time log viewer featuring
  search, filtering, multi-container support, and lightweight web interface.
---

![Dozzle](https://dozzle.dev/logo.svg)

## What is Dozzle?

Dozzle is an open-source project sponsored by Docker OSS. It is a log viewer designed to simplify monitoring and debugging containers. This lightweight, web-based application offers real-time log streaming, filtering, and searching capabilities through an intuitive user interface.

Users can quickly access logs generated by their Docker containers, making it an essential tool for debugging and troubleshooting applications in a Docker environment. By default, Dozzle supports JSON logs with intelligent color coding.

Dozzle is easy to install and configure, making it an ideal solution for developers and system administrators seeking an efficient, user-friendly log viewer for their Docker environment. The tool is available under the MIT license and is actively maintained by its developer, Amir Raminfar.

## Deployment Variants

Dozzle is available in two deployment configurations in Coolify:

### Dozzle (Default)

* **Authentication:** No authentication (open access)
* **Use case:** Development environments, trusted networks, or single-user setups
* **Components:** Single Dozzle container with Docker socket access

### Dozzle with Authentication

* **Authentication:** Built-in authentication with user management
* **Use case:** Production environments, multi-user access, or security-sensitive deployments
* **Components:**
  * Dozzle container with authentication enabled
  * User credential management
  * Docker socket access

## Links

* [The official website](https://dozzle.dev/guide/getting-started#running-with-docker?utm_source=coolify.io)
* [GitHub](https://github.com/amir20/dozzle?utm_source=coolify.io)

---

---
url: /docs/databases/dragonfly.md
description: >-
  Deploy DragonFly in-memory datastore on Coolify with Redis compatibility,
  multi-threaded architecture, and enhanced scalability features.
---

# DragonFly

![dragonfly](/images/database-logos/dragonfly-dark.svg)

## What is DragonFly

DragonFly is a modern in-memory datastore, designed as a Redis alternative with better scalability and resource efficiency. It offers a Redis-compatible API while providing improved performance on multi-core systems. DragonFly is built to handle high-throughput scenarios and large datasets more efficiently than traditional in-memory datastores.

With its multi-threaded architecture and advanced data structures, DragonFly aims to provide enhanced scalability and performance for applications that require Redis-like functionality on modern hardware.

## Data Persistence

By default, Dragonfly DB does not save data to disk. To enable persistence, set up snapshots manually.

For example, configure the service with:

```yaml
services:
  dragonfly:
    command: 'dragonfly --requirepass XXXXXXXX --dir /data --dbfilename dragonfly-snapshot-{timestamp} --snapshot_cron "*/5 * * * *"'
```

You can also trigger manual saves using the SDK's `SAVE` command.

## Links

* [The official website](https://dragonflydb.io/?utm_source=coolify.io)
* [GitHub](https://github.com/dragonflydb/dragonfly?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/drain-logs.md
description: >-
  Stream Coolify application logs to Axiom, New Relic, or custom FluentBit
  destinations for centralized monitoring and log analysis.
---

# Drain Logs

You can drain logs of your deployed services to a third-party applications like [Axiom](https://axiom.co/) or [New Relic](https://newrelic.com).

> We will support more services in the future, like Signoz, HyperDX, etc.

## How to enable?

1. Enable on your Server.
   * First, you need to enable it on your `Server` settings.
   * Go to your `Server` where you want to enable the `Drain Logs` and click on the `Log Drains` tab.

2. Enable on your Resource.
   * Go to your resource, `Advanced` tab and enable the `Drain Logs` for the resource.

::: warning Caution
Once you enabled at least one of the `Drain Logs`, you need to `Restart` your
service to apply the changes.
:::

## How to configure?

### Axiom

You need to have a `Dataset` and an `API key` from Axiom.

More information [here](https://axiom.co/docs).

### New Relic

You need to have an `License key` from New Relic.

More information [here](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/#ingest-license-key).

#### Identify logs by application (per-service names)

If you run multiple services (e.g. web, worker, db) and want to split logs by service in New Relic, add a stable app name to every log event.

##### How to enable

1. Go to your **resource -> Configuration -> Environment Variables** and add
   `COOLIFY_APP_NAME=web`
   (use any short identifier like web, worker, db, etc.).  ï¿¼

2. **Restart** the resource for the change to take effect. (Log drains & env changes apply on restart.)

When COOLIFY\_APP\_NAME is present, New Relic will receive a coolify.app\_name attribute which you can use to filter logs by service in New Relic.

## Custom FluentBit configuration

If you know how to configure FluentBit, you can use the `Custom FluentBit configuration` to configure the drain logs.

---

---
url: /docs/services/drizzle-gateway.md
description: >-
  Deploy and host Drizzle Studio with Coolify to explore SQL databases in your
  Drizzle ORM project visually and efficiently.
---

# Drizzle Gateway

## What is Drizzle Gateway?

Drizzle Studio is a new way for you to explore SQL database on Drizzle ORM project.

## Links

* [The official website](https://orm.drizzle.team/docs/get-started/postgresql-new?utm_source=coolify.io)
* [GitHub](https://github.com/drizzle-team/drizzle-orm?utm_source=coolify.io)

---

---
url: /docs/services/drupal.md
description: >-
  Deploy Drupal CMS on Coolify for enterprise content management with powerful
  APIs, content types, workflows, and extensive module ecosystem.
---

# Drupal

## What is Drupal

Drupal is a free and open-source web content management system written in PHP and distributed under the GNU General Public License.

## Links

* [Official Documentation](https://www.drupal.org/about?utm_source=coolify.io)

---

---
url: /docs/services/duplicati.md
description: >-
  Host Duplicati backup on Coolify with encrypted cloud backups, incremental
  updates, scheduling, and restore capabilities for data protection.
---

![Duplicati](https://avatars.githubusercontent.com/u/8270231?s=200\&v=4)

## What is Duplicati?

Free backup software to store encrypted backups online for Windows, macOS and Linux.

## Links

* [The official website](https://www.duplicati.com?utm_source=coolify.io)
* [GitHub](https://github.com/duplicati/duplicati?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/proxy/traefik/dynamic-config.md
description: >-
  Configure Traefik proxy on the fly without restarts using Coolify's dynamic
  configuration system for real-time middleware and routing updates.
---

# Dynamic Configurations

Dynamic configurations are used to configure Traefik on the fly, without restarting it.

You can add them by going to the `Server/Proxy` view, and select `Dynamic Configurations` from the sidebar.

::: tip Tip
Some of the dynamic configurations cannot be deleted, as they required for
Coolify itself.
:::

---

---
url: /docs/services/easyappointments.md
description: >-
  Run Easy!Appointments on Coolify for online booking system with calendar sync,
  customer management, SMS notifications, and service scheduling.
---

# Easyappointments

## What is Easyappointments

Schedule Anything. Let's start with easy! Get the best free online appointment scheduler on your server, today.

## Links

* [Official Documentation](https://easyappointments.org/?utm_source=coolify.io)

---

---
url: /docs/services/elasticsearch.md
description: Here you can find the documentation for hosting Elasticsearch with Coolify.
---

# Elasticsearch

![ElasticSearch](/images/services/elasticsearch-logo.svg)

## What is Elasticsearch?

Elasticsearch is an open-source search and analytics engine designed for fast, scalable data retrievalâ€”ideal for handling large volumes of both structured and unstructured data.

## How to Deploy Elasticsearch on Coolify

There are two ways to deploy Elasticsearch on Coolify:

* **Elasticsearch as a standalone service** (no GUI)
* **Elasticsearch with Kibana** (GUI)

***

## Elasticsearch as a Standalone Service

1. Create a new resource on Coolify and select **Elasticsearch with Kibana** from the service list.
2. Click the **Deploy** button to pull the Docker images and start the containers.
3. Once the `Elasticsearch` service shows as healthy, you can access it via its assigned domain.
   > âš ï¸ Note: This version does not include a GUIâ€”youâ€™ll need to interact with it via CLI tools or APIs.

***

## Deploy Elasticsearch with Kibana

1. Create a new resource on Coolify and select **Elasticsearch with Kibana** from the service list.
2. Click the **Deploy** button to pull the Docker images and start the containers.
3. Once the `Elasticsearch` service is running and the `Kibana Token Generator` shows an **exited** status:
   * Open the logs of the `Kibana Token Generator` service.
   * Copy the **Service Token** from the logs.
   * Paste the token into the `ELASTICSEARCH_SERVICEACCOUNTTOKEN` environment variable.
   * Restart the service (click the **Restart** button).
4. After both `Elasticsearch` and `Kibana` services are running healthy, visit the domain assigned to the service.
   * Youâ€™ll be presented with the Elastic login page.
   * **Username:** `elastic`\
     **Password:** value of the `SERVICE_PASSWORD_ELASTICSEARCH` environment variable.

If any of the above steps are unclear, you can refer to [this Pull Request](https://github.com/coollabsio/coolify/pull/6470), which includes a video walkthrough of the entire deployment process.

***

### Notes for Elasticsearch with Kibana

1. It can take over **2 minutes** for all services to fully start (depending on your serverâ€™s performance).
2. The JVM heap size is set to **512MB** by default to prevent Elasticsearch from exhausting server memory.
   > To increase this value, modify the environment variable:\
   > `ES_JAVA_OPTS=-Xms512m -Xmx512m` in the Docker Compose file.
3. The `Kibana Token Generator` service is designed to **run once and then exit**. This is expected behavior and does not impact the health of the Elastic or Kibana services.
4. Clustering is **disabled by default** via the `discovery.type=single-node` environment variable.
   > Update this setting if clustering is required.

***

## Useful Links

* [Official Website](https://www.elastic.co/?utm_source=coolify.io)
* [Official Documentation](https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-kibana-with-docker?utm_source=coolify.io)

---

---
url: /docs/services/emby.md
description: >-
  Host Emby media server on Coolify for streaming movies, TV shows, music, and
  photos with transcoding, mobile apps, and DVR capabilities.
---

![Emby](https://emby.media/support/images/logo.png)

## What is Emby?

Emby is a free personal media server. It is built with a number of popular open source technologies.

## Requirements

Windows, Mac, Linux, or FreeBSD computer

### Minimum Requirements â€” no transcoding

* Intel Core 2 Duo processor 1.6 GHz or better
* At least 1GB RAM for Windows/Mac OS X
* At least 512MB RAM for Linux
* Windows: Vista or later
* OS X: MacOS 10.13 or later
* Ubuntu, Debian, Fedora, CentOS or SuSE Linux

### Recommended Configuration â€” transcoding HD Content

* Intel Core 2 Duo processor 2.4 GHz or better
* If transcoding for multiple devices, a faster CPU may be required
* At least 2GB RAM
* Windows: Vista or later
* OS X: MacOS 10.13 or later
* Ubuntu, Debian, Fedora, CentOS or SuSE Linux

## Community

* [The official website](https://emby.media?utm_source=coolify.io)
* [The Emby community](https://emby.media/community?utm_source=coolify.io)

---

---
url: /docs/services/embystat.md
description: >-
  Track Emby server usage on Coolify with EmbyStat featuring media statistics,
  playback analytics, user metrics, and library health monitoring.
---

![Emby Stat](https://raw.githubusercontent.com/mregni/EmbyStat/develop/branding/logo-color.png)

## What is Emby Stat?

EmbyStat is a personal web server that can calculate all kinds of statistics from your (local) Emby or Jellyfin server. Just install this on your server and let him calculate all kinds of fun stuff.

## Links

* [The official website](https://github.com/mregni/EmbyStat?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/proxy/traefik/dashboard.md
description: >-
  Enable and secure Traefik dashboard in Coolify with basic authentication,
  dynamic configuration, Let's Encrypt SSL, and custom domain access.
---

# Traefik Dashboard

By default, the Traefik dashboard is enabled in secure mode, but not configured to be accessible from the internet.

To enable access from the internet, you need to add a dynamic configuration and secure it with a username and password.

## Secure mode (with Dynamic Configuration)

::: info Tip
How to configure Traefik's dynamic configuration? [Read more](/knowledge-base/proxy/traefik/dynamic-config)
:::

You can enable Traefik's dashboard by adding the following dynamic configuration:

```yaml
http:
  middlewares:
    auth:
      basicAuth:
        users:
          - "<GENERATED_USERNAME>:<GENERATED_PASSWORD>"
    redirect-to-https:
      redirectScheme:
        scheme: https

  routers:
    dashboard-http:
      rule: Host(`<DOMAIN_FOR_TRAEFIK>`) && (PathPrefix(`/dashboard`) || PathPrefix(`/api`))
      entryPoints:
        - http
      service: api@internal
      middlewares:
        - redirect-to-https

    dashboard-https:
      rule: Host(`<DOMAIN_FOR_TRAEFIK>`) && (PathPrefix(`/dashboard`) || PathPrefix(`/api`))
      entryPoints:
        - https
      service: api@internal
      tls:
        certResolver: letsencrypt
      middlewares:
        - auth
```

Replace `<DOMAIN_FOR_TRAEFIK>`, `<GENERATED_USERNAME>`, and `<GENERATED_PASSWORD>` with your own values.

You can reach the dashboard by visiting `https://<DOMAIN_FOR_TRAEFIK>/dashboard/#/`.

### How to generate user/password?

You can generate one with the [htpasswd](https://httpd.apache.org/docs/current/programs/htpasswd.html) command:

```bash
htpasswd -nbB test test
```

Example output:

```bash
test:$apr1$H6uskkkW$IgXLP6ewTrSuBkTrqE8wj/
```

## Insecure Mode (Not Recommended)

If you want to enable the dashboard in insecure mode (without a password), all you need to do is go to the proxy configurations view and change the `insecure` setting to `true`, then restart the proxy..

```yaml
- '--api.insecure=true'
```

---

---
url: /docs/services/ente-photos.md
description: Here you can find the documentation for hosting Ente with Coolify.
---

# Ente

![Ente](/images/services/ente-logo.webp)

## What is Ente?

Ente is a service that provides a fully open-source, end-to-end encrypted platform for you to store your data in the cloud without needing to trust the service provider. On top of the platform, Ente has built two apps so far: Ente Photos (an alternative to Apple and Google Photos) and Ente Auth (a 2FA alternative to the deprecated Authy).

Learn more at [help.ente.io](https://help.ente.io/).

## Configuring Object Store

* Once you have selected your service. You will need to set up of some environment variables for your S3 bucket or substitute like MinIO.

### 1. Remote S3 bucket

* For AWS S3 you can create a bucket and allow access via IAM Roles/User Permissions. Which will generate an access key and secrect key for your S3 Bucket.

* For the S3 bucket, apply the following CORS policy for proper access control from the museum service.

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD", "POST", "PUT", "DELETE"],
    "MaxAgeSeconds": 3000,
    "ExposeHeaders": ["Etag"]
  }
]
```

* Fill the credentials like `endpoint`, `region`, `bucket`, `access key`, `secret key`.

* Deploy the Service and you are good to go.

### 2. Coolify minio bucket.

* Minio is expected to be exposed over HTTPS and needs SSL/TLS, so make sure your proxies are setup properly. Here is a useful [link](https://selfhostschool.com/minio-self-hosted-s3-storage-guide/) for set up and configuration.

* Once you have deployed the Minio service from Coolify you can login to the service from the console URL and use the same username and password as set in the environment variables user the API URL for backend or shell based usecases.

```bash
# Set Alias
mc alias set <alias> <API_ENDPOINT> <ACCESS_KEY> <SECRET_KEY>

# List buckets (same us used in coolify to validate S3)
minio/mc ls myminio
```

* Once logged in, create a bucket for your use in Ente.

* The default region for Minio is `us-east-1`, so you can use the same.

* Use the API endpoint as bucket endpoint for Ente config.

**Note**: Additional details are available [here](https://help.ente.io/self-hosting/administration/object-storage).

## Environment Variables

| Variable Name                         | Service  | Description                                                                                 | Default Value      | Required | Prefilled |
| ------------------------------------- | -------- | ------------------------------------------------------------------------------------------- | ------------------ | -------- | --------- |
| `SERVICE_URL_MUSEUM_8080`             | museum   | URL for the museum service on port 8080                                                     | -                  | Yes      | Yes       |
| `ENTE_HTTP_USE_TLS`                   | museum   | Enable/disable TLS for HTTP connections                                                     | `false`            | No       | Yes       |
| `SERVICE_URL_WEB_3002`                | museum   | URL for the web albums service                                                              | -                  | Yes      | Yes       |
| `SERVICE_URL_WEB_3004`                | museum   | URL for the web cast service                                                                | -                  | Yes      | Yes       |
| `SERVICE_URL_WEB_3001`                | museum   | URL for the web accounts service                                                            | -                  | Yes      | Yes       |
| `ENTE_DB_HOST`                        | museum   | PostgreSQL database host                                                                    | `postgres`         | No       | Yes       |
| `ENTE_DB_PORT`                        | museum   | PostgreSQL database port                                                                    | `5432`             | No       | Yes       |
| `ENTE_DB_NAME`                        | museum   | PostgreSQL database name                                                                    | `ente_db`          | No       | Yes       |
| `SERVICE_USER_POSTGRES`               | museum   | PostgreSQL database username                                                                | `pguser`           | No       | Yes       |
| `SERVICE_PASSWORD_POSTGRES`           | museum   | PostgreSQL database password                                                                | -                  | Yes      | Yes       |
| `SERVICE_REALBASE64_ENCRYPTION`       | museum   | Base64 encoded encryption key                                                               | -                  | Yes      | Yes       |
| `SERVICE_REALBASE64_64_HASH`          | museum   | Base64 encoded hash key                                                                     | -                  | Yes      | Yes       |
| `SERVICE_REALBASE64_JWT`              | museum   | Base64 encoded JWT secret                                                                   | -                  | Yes      | Yes       |
| `ENTE_INTERNAL_ADMIN`                 | museum   | Internal admin user ID                                                                      | `1580559962386438` | No       | Yes       |
| `ENTE_INTERNAL_DISABLE_REGISTRATION`  | museum   | Disable user registration                                                                   | `false`            | No       | Yes       |
| `PRIMARY_STORAGE_ARE_LOCAL_BUCKETS`   | museum   | Use local buckets for primary storage (false unless you are connecting to bucket over http) | `false`            | No       | Yes       |
| `PRIMARY_STORAGE_USE_PATH_STYLE_URLS` | museum   | Use path-style URLs for storage                                                             | `true`             | No       | Yes       |
| `S3_STORAGE_KEY`                      | museum   | S3 storage access key                                                                       | -                  | Yes      | No        |
| `S3_STORAGE_SECRET`                   | museum   | S3 storage secret key                                                                       | -                  | Yes      | No        |
| `S3_STORAGE_ENDPOINT`                 | museum   | S3 storage endpoint URL                                                                     | -                  | Yes      | No        |
| `S3_STORAGE_REGION`                   | museum   | S3 storage region                                                                           | `us-east-1`        | No       | Yes       |
| `S3_STORAGE_BUCKET`                   | museum   | S3 storage bucket name                                                                      | -                  | Yes      | No        |
| `SERVICE_URL_WEB_3000`                | web      | URL for the main web service                                                                | -                  | Yes      | Yes       |
| `SERVICE_URL_MUSEUM`                  | web      | URL for the museum service                                                                  | -                  | Yes      | Yes       |
| `SERVICE_URL_WEB_3002`                | web      | URL for the albums service                                                                  | -                  | Yes      | Yes       |
| `SERVICE_USER_POSTGRES`               | postgres | PostgreSQL username                                                                         | `pguser`           | No       | Yes       |
| `SERVICE_PASSWORD_POSTGRES`           | postgres | PostgreSQL password                                                                         | -                  | Yes      | Yes       |
| `SERVICE_DB_NAME`                     | postgres | PostgreSQL database name                                                                    | `ente_db`          | No       | Yes       |

## Links

* [The official website](https://ente.io?utm_source=coolify.io)
* [Documentation](https://help.ente.io?utm_source=coolify.io)
* [GitHub](https://github.com/ente-io/ente?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/environment-variables.md
description: >-
  Manage build-time and runtime environment variables in Coolify with team,
  project, and environment-based shared variables plus predefined system values.
---

# Environment Variables

You can define environment variables for your resources, and they will be available in your application.

> Preview Deployments could have different environment variables, so you can test your application as a staging environment for example.

## Build Time Variables

If you would like to set environment variables for the build process, you can do it by setting the checkbox `Build Variable` in the normal view on the UI.

## Shared Variables

You could have 3 types of shared variables:

1. Team Based
2. Project Based
3. Environment Based (production, staging, etc.)

You can set shared variables on their respective pages.

Then you can use these variables anywhere. For example: You defined `NODE_ENV` to `production`.

### Team Based

You can set them on the `Team` page and use it with {{team.NODE\_ENV}}. Do not replace "team" with your actual team name.

### Project Based

You can set them on the `Projects` page, under the gear icon and use it with {{project.NODE\_ENV}}. Do not replace "project" with your actual project name.

### Environment Based

You can set them on the `Environments` page (select a `Project`), under the gear icon and use it with {{environment.NODE\_ENV}} Do not replace "environment" with your actual environment name.

### Using Environment and Shared Variables in Docker Compose

Within Coolify you can configure these easily following the details found in the [Knowledge Base for Docker Compose](/knowledge-base/compose#defining-environment-and-shared-variables).

## Predefined Variables

Coolify predefines some variables for you, so you can use them in your application or service. All you need to do is to add an environment variable like this to your application or service.

```bash
# For example, you can use this variable in your application
MY_VARIABLE=$SOURCE_COMMIT
# You will have the commit hash of the source code in your application as an environment variable in MY_VARIABLE
```

### Application Variables

#### `COOLIFY_FQDN`

Fully qualified domain name(s) of the application.

#### `COOLIFY_URL`

URL(s) of the application.

#### `COOLIFY_BRANCH`

Branch name of the source code.

#### `COOLIFY_RESOURCE_UUID`

Unique resource identifier generated by Coolify.

#### `COOLIFY_CONTAINER_NAME`

Name of the container generated by Coolify.

#### `SOURCE_COMMIT`

Commit hash of the source code.

::: tip Build Cache
By default, `SOURCE_COMMIT` is not included in Docker builds to preserve cache. Enable "Include Source Commit in Build" in your application's General settings if your build process needs this value.
:::

#### `PORT`

If not set: it is set to the `Port Exposes`'s first port.

#### `HOST`

If not set: it is set to `0.0.0.0`

### Service Stack Variables

#### `SERVICE_NAME_<SERVICE>`

The service name of a given service in the stack. For example, if you have a service named `web`, you can access it with `SERVICE_NAME_WEB`. Useful for preview deployments where service names will vary.

---

---
url: /docs/services/evolution-api.md
description: >-
  Deploy Evolution API on Coolify for WhatsApp Business integration, message
  automation, chatbot workflows, and customer communication management.
---

## What is Evolution API?

Evolution API is a robust platform devoted to empowering small businesses, entrepreneurs, freelancers, and individuals with limited resourcesâ€”offering more than just a basic WhatsAppâ„¢ messaging solution.

## What I need to configure to make Coolify work with Evolution API?

The docker-compose available in Coolify should be able to install everything you need to start with the Evolution API + Postgres + Redis + Evolution Manager.

Once everything is running, you can access your https://url/manager.

## Screenshots

## Links

* [GitHub](https://github.com/EvolutionAPI/evolution-api?utm_source=coolify.io)
* [Official Documentation](https://doc.evolution-api.com/v1/en/get-started/introduction?utm_source=coolify.io)

---

---
url: /docs/services/excalidraw.md
description: >-
  Run Excalidraw on Coolify for collaborative whiteboarding with hand-drawn
  diagrams, real-time collaboration, and export options for visual thinking.
---

# Excalidraw

## What is Excalidraw?

Excalidraw is a virtual whiteboard for sketching hand-drawn like diagrams. It's a collaborative drawing tool that allows you to create diagrams that feel hand-drawn. Excalidraw is perfect for wireframing, brainstorming, creating flowcharts, and collaborative design sessions. It supports real-time collaboration, exports to various formats, and has an intuitive interface that makes digital sketching feel natural.

## Links

* [The official website](https://excalidraw.com?utm_source=coolify.io)
* [GitHub](https://github.com/excalidraw/excalidraw?utm_source=coolify.io)

---

---
url: /docs/troubleshoot/docker/expired-github-personal-access-token.md
description: >-
  Fix GitHub Container Registry authentication errors by logging out of ghcr.io
  or renewing expired GitHub Personal Access Tokens for Docker deployments.
---

# Expired GitHub Personal Access Token (PAT)

If you encounter the following errors, it means Docker cannot authenticate with the GitHub Container Registry (ghcr.io):

## Error

```sh
  Error response from daemon: Head "https://ghcr.io/v2/coollabsio/coolify-helper/manifests/1.0.1": unauthorized: authentication required
```

> or

```sh
  Unable to find image 'ghcr.io/coollabsio/coolify-helper:latest' locally
  docker: Error response from daemon: Head "https://ghcr.io/v2/coollabsio/coolify-helper/manifests/latest": denied: denied
```

## Solution

You have two options:

* Log out of GitHub Container Registry (ghcr.io) by running:
  ```sh
    docker logout ghcr.io
  ```
* Renew your GitHub Personal Access Token (PAT) if you need to maintain authenticated access for deployments.

---

---
url: /docs/troubleshoot/applications/failed-to-get-token.md
description: >-
  Fix GitHub access token errors in Coolify deployments caused by NTP time
  synchronization issues affecting JWT 'iat' claim validation during
  authentication.
---

# Failed To Get Access Token

Your deployment failed because it cannot get the access token from GitHub.

The error is usually related to NTP time synchronization issue.

## Error

`'Issued at' claim (iat) must be an Integer representing the time that assertation issued.`

## Solution

You must do the same as the [2FA Stopped Working](/troubleshoot/server/two-factor-stopped-working) solution.

---

---
url: /docs/knowledge-base/faq.md
description: >-
  Common Coolify questions answered including SSH permissions, custom ports,
  Cloudflare SSL, concurrent builds, and application port mapping
  troubleshooting.
---

# Frequently Asked Questions (FAQ)

## Coolify

### Coolify is not updating to the newest version.

When a new version is released and a new GitHub release is created, it doesn't immediately become available for your instance. Read more about [Coolifys Release Cycle](https://github.com/coollabsio/coolify/blob/v4.x/RELEASE.md) on GitHub.

## Server

### Permission denied (publickey).

::: tip Error
Error: `Server is not reachable. Reason: root@host.docker.internal: Permission denied (publickey).`

:::

Your Coolify instance cannot reach the server it is running on. During installation, a public key is generated to `/data/coolify/ssh/keys/id.root@host.docker.internal.pub` and automatically added to `~/.ssh/authorized_keys`.

If it is not added, you can add it manually by running the following command on your server:

```bash
  cat /data/coolify/ssh/keys/id.root@host.docker.internal.pub >> ~/.ssh/authorized_keys
```

### Custom SSH Port

If you would like to use a custom SSH port, you can set it in the `Server` tab of your server.

If you are self-hosting Coolify, you can simply set it after you installed Coolify on the `localhost` server.

### Increase Concurrent Builds

If you would like to increase the number of concurrent builds, you can set it in the `Server` tab of your server.

### Coolify Cloud Public IPs

If you need the public facing IPs to allow inbound connections to your servers, here is an up-to-date list of IPs that you can use to whitelist:

* https://coolify.io/ipv4.txt
* https://coolify.io/ipv6.txt

## Cloudflare

### Configured but application is not reachable.

You need to set your SSL/TLS configuration to at least `Full` in your Cloudflare dashboard.

Documentation: https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full/

### Too many redirections.

You need to set your SSL/TLS configuration to at least `Full` in your Cloudflare dashboard.

Documentation: https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full/

## Applications

### How to map a port the server?

If you want to map a port the host system (server), you need to use [Ports Mappings](/applications/#port-mappings) feature.

## SSL & HTTPS

### How do I enable HTTPS/SSL for my application?

HTTPS is automatically enabled when you enter a domain using the `https://` protocol (for example, `https://example.com`). Coolify will automatically configure your reverse proxy and request SSL certificates from Let's Encrypt. You don't need to do any additional setup.

For more details, see the [Domains documentation](/knowledge-base/domains#https-ssl-certificates).

### My application is showing a certificate warning in the browser. What should I do?

If your browser shows a certificate warning or indicates a self-signed certificate, it means the automatic certificate issuance from Let's Encrypt failed. This is usually due to DNS configuration issues, firewall problems, or port accessibility.

See the [Let's Encrypt Not Working](/troubleshoot/dns-and-domains/lets-encrypt-not-working) troubleshooting guide for detailed solutions.

### Do SSL certificates renew automatically?

Yes. Coolify automatically renews SSL certificates from Let's Encrypt before they expire. Let's Encrypt certificates are valid for 90 days, and Coolify handles all renewals seamlessly in the background.

---

---
url: /docs/services/faraday.md
description: >-
  Host Faraday security platform on Coolify for penetration testing management,
  vulnerability tracking, and collaborative security assessment workflows.
---

# Faraday

## What is Faraday

Faraday is a powerful, open-source, web-based vulnerability management tool.

## Links

* [Official Documentation](https://faradaysec.com/?utm_source=coolify.io)

---

---
url: /docs/services/fider.md
description: >-
  Deploy Fider feedback platform on Coolify for product ideas, feature voting,
  roadmap planning, and customer feedback collection for product teams.
---

![Fider](https://github.com/getfider/fider/raw/main/etc/homepage.png)

## What is Fider?

Fider is a feedback portal for feature requests and suggestions. Give your customers a voice and let them tell you what they need. Spend less time guessing and more time building the right product.

## How to setup

See the official [Fider + Coolify guide](https://docs.fider.io/hosting-coolify?utm_source=coolify.io)

## Links

* [The official website](https://fider.io?utm_source=coolify.io)

---

---
url: /docs/services/filebrowser.md
description: >-
  Run File Browser on Coolify for web-based file management with uploads,
  sharing, search, and access control for self-hosted cloud storage.
---

![Filebrowser](https://raw.githubusercontent.com/filebrowser/logo/master/banner.png)

## What is Filebrowser?

Filebrowser provides a file managing interface within a specified directory and it can be used to upload, delete, preview, rename and edit your files. It allows the creation of multiple users and each user can have its own directory. It can be used as a standalone app.

## Setup

* Deploy Filebrowser using Coolify template
* In the Filebrowser UI login with credentials:
  * Username: `admin`
  * Password: randomly generated, viewable in the logs

## Screenshots

![gif](https://user-images.githubusercontent.com/5447088/50716739-ebd26700-107a-11e9-9817-14230c53efd2.gif)

## Demo

Link: [Filebrowser Demo](https://demo.filebrowser.org/?utm_source=coolify.io)

Credentials: demo/demo

## Links

* [The official Filebrowser website](https://filebrowser.org?utm_source=coolify.io)
* [GitHub](https://github.com/filebrowser/filebrowser?utm_source=coolify.io)

---

---
url: /docs/services/fileflows.md
description: >-
  Host FileFlows on Coolify for automated file processing, media conversion,
  organization workflows, and batch operations with visual flow builder.
---

## What is FileFlows?

Are you tired of manually managing your files? Meet FileFlows â€” the ultimate solution for automatic file processing!

FileFlows lets you monitor and process any file type with custom flows. Videos, audio, images, archives, comics, eBooksâ€”you name it!

## Installation

1. Create the service within Coolify.
2. If your device supports it, enable hardware transcoding by uncommenting this section in the compose file:

```yaml
#devices:
# - "/dev/dri:/dev/dri"
```

## Screenshots

## Links

* [The official website](https://fileflows.com/)
* [Doc](https://fileflows.com/docs)

---

---
url: /docs/services/firefly.md
description: >-
  Manage personal finances on Coolify with Firefly III featuring budgets,
  reports, recurring transactions, and multi-currency expense tracking.
---

![Firefly III](https://raw.githubusercontent.com/firefly-iii/firefly-iii/develop/.github/assets/img/logo-small.png)

## What is Firefly III?

"Firefly III" is a (self-hosted) manager for your personal finances. It can help you keep track of your expenses and income, so you can spend less and save more. Firefly III supports the use of budgets, categories and tags. Using a bunch of external tools, you can import data. It also has many neat financial reports available.

Firefly III should give you insight into and control over your finances. Money should be useful, not scary. You should be able to see where it is going, to feel your expenses and to... wow, I'm going overboard with this aren't I?

But you get the idea: this is your money. These are your expenses. Stop them from controlling you. I built this tool because I started to dislike money. Having money, not having money, paying bills with money, you get the idea. But no more. I want to feel "safe", whatever my balance is. And I hope this tool can help you. I know it helps me.

## Screenshots

![Firefly III screenshot](https://raw.githubusercontent.com/firefly-iii/firefly-iii/develop/.github/assets/img/imac-complete.png)

## Links

* [The official website](https://firefly-iii.org?utm_source=coolify.io)
* [GitHub](https://github.com/firefly-iii/firefly-iii?utm_source=coolify.io)

---

---
url: /docs/services/firefox.md
description: >-
  Run Firefox browser on Coolify in containerized environment for secure web
  browsing, testing, and isolated internet access via web interface.
---

# Firefox

## What is Firefox

Fast, private, and self-hosted secure browser for browsing without limits.

## Links

* [Official Documentation](https://github.com/jlesage/docker-firefox?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/server/firewall.md
description: >-
  Configure firewall ports for Coolify including SSH, HTTP/HTTPS, dashboard
  access, and terminal with ufw-docker setup for self-hosted and cloud
  instances.
---

# Firewall

Coolify requires specific network ports to be open in order to function properly across various environments. These ports enable web access, SSH connections, terminal sessions, and real-time communication.

The required ports may vary slightly depending on whether you're using a self-hosted setup or the managed version ([Coolify Cloud](https://coolify.io/pricing/)).

## Coolify Self-hosted

To ensure proper functionality when self-hosting Coolify, the following ports should be opened:

* **8000** â€“ HTTP access to the Coolify dashboard
* **6001** â€“ Real-time communications
* **6002** â€“ Terminal access (Required for Coolify version 4.0.0-beta.336 and above)
* **22** â€“ SSH access (or your custom SSH port)
* **80** â€“ SSL certificate generation via reverse proxy (Traefik or Caddy)
* **443** â€“ HTTPS traffic

These ports are required if you're accessing Coolify directly using your serverâ€™s IP address (e.g., `http://<SERVER_IP>:8000`).

::: success Tip
If you're using a custom domain with Coolifyâ€™s integrated reverse proxy (Traefik or Caddy), you can safely close ports **8000**, **6001**, and **6002** after accesing the dashboard from your custom domain.
:::

::: warning Caution
If you are using `Oracle Cloud Free ARM Server`, you need to allow these ports
inside Oracle's Dashboard, otherwise you cannot reach your instance from the
internet after installation.
:::

## Coolify Cloud

For Servers connected to Coolify Cloud, the following ports must be open:

* **22** â€“ SSH access (or your custom SSH port)
* **80** â€“ SSL certificate generation via reverse proxy (Traefik or Caddy)
* **443** â€“ HTTPS traffic

These are the only required ports, as all other services are managed for you by Coolify Cloud.

## Closing Ports Using a Firewall

Coolify runs on Docker, which uses NAT-based iptables rules that can bypass traditional Linux firewalls like UFW. As a result, blocking ports using UFW alone will not be effective.

### Recommended Approach

Most cloud providers offer integrated firewalls through their dashboards. If your provider supports this, **it is highly recommended to use their firewall settings** to manage open ports instead of relying on local tools like UFW.

If your provider does not offer firewall functionality, you can use one of the following advanced methods:

### Coolify Self-hosted

::: danger CAUTION!!
Modifying firewall settings incorrectly may lead to access issues that are difficult to recover from.

Proceed with the following steps **only if necessary**, and if you fully understand the implications.
:::

#### Use `ufw-docker`

[ufw-docker](https://github.com/chaifeng/ufw-docker) is a community-maintained tool that helps bridge UFW and Docker by allowing you to block specific ports effectively. Refer to the [GitHub repository](https://github.com/chaifeng/ufw-docker) for complete setup instructions

***

### Coolify Cloud

For servers connected to Coolify Cloud, only the SSH port (typically **22**) needs to be open for remote management.

If you wish to restrict access based on IP address, we have a list of public IPs used by Coolify Cloud:

* [IPv4 addresses](https://coolify.io/ipv4.txt)
* [IPv6 addresses](https://coolify.io/ipv6.txt)

Coolify Cloudâ€™s IPs rarely change, but users will be notified by email if updates occur.

### GitHub Integration

GitHub uses webhooks to communicate with Coolify. For this to work correctly:

* Ensure **TCP ports 80 and 443** are open.
* (Optional) To restrict webhook access by IP, you can get the current list of GitHubâ€™s outbound IPs from: https://api.github.com/meta (Check the `hooks` section)

For more details, refer to their [documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-githubs-ip-addresses)

---

---
url: /docs/services/flipt.md
description: >-
  Host Flipt feature flags on Coolify for feature toggles, A/B testing, gradual
  rollouts, and environment-specific configuration management.
---

# Flipt

## What is Flipt

Flipt is a fully managed feature flag solution that enables you to keep your feature flags and remote config next to your code in Git.

## Links

* [Official Documentation](https://docs.flipt.io/cloud/overview?utm_source=coolify.io)

---

---
url: /docs/services/flowise.md
description: >-
  Build AI workflows on Coolify with Flowise drag-and-drop LLM interface for
  chatbots, agents, RAG applications, and custom AI tool integration.
---

# Flowise

## What is Flowise

Flowise is an open source low-code tool for developers to build customized LLM orchestration flows & AI agents.

## Deployment Variants

Flowise is available in two deployment configurations in Coolify:

### Flowise (Default)

* **Database:** SQLite (embedded)
* **Use case:** Simple deployments, testing, or personal AI workflow development
* **Components:** Single Flowise container with built-in SQLite database

### Flowise with Databases

* **Database:** PostgreSQL + Redis
* **Use case:** Production deployments requiring better performance, caching, and scalability
* **Components:**
  * Flowise container
  * PostgreSQL container for data persistence
  * Redis container for caching and session management
  * Automatic database configuration and health checks

## Links

* [Official Documentation](https://docs.flowiseai.com/?utm_source=coolify.io)

---

---
url: /docs/services/forgejo.md
description: >-
  Deploy Forgejo Git hosting on Coolify as lightweight GitHub alternative with
  repositories, CI/CD, issues, pull requests, and collaboration tools.
---

![forgejo](https://forgejo.org/images/forgejo-wordmark.svg)

## What is Forgejo?

Forgejo is a self-hosted lightweight software forge. It's easy to install and low maintenance, it just does the job.

## Deployment Variants

Forgejo is available in four deployment configurations in Coolify:

### Forgejo (Default)

* **Database:** SQLite (embedded)
* **Use case:** Simple deployments, testing, or personal Git hosting
* **Components:** Single Forgejo container with built-in SQLite database

### Forgejo with PostgreSQL

* **Database:** PostgreSQL
* **Use case:** Production deployments requiring better performance and scalability
* **Components:**
  * Forgejo container
  * PostgreSQL container
  * Automatic database configuration and health checks

### Forgejo with MySQL

* **Database:** MySQL
* **Use case:** Production deployments with MySQL preference
* **Components:**
  * Forgejo container
  * MySQL container
  * Automatic database configuration and health checks

### Forgejo with MariaDB

* **Database:** MariaDB
* **Use case:** Production deployments with MariaDB preference
* **Components:**
  * Forgejo container
  * MariaDB container
  * Automatic database configuration and health checks

## Forgejo Actions Runner

Forgejo has available a first party "actions runner" to [execute task jobs on a repository](https://forgejo.org/docs/latest/user/actions/), much like [GitHub Actions](https://docs.github.com/en/actions) or [GitLab CI](https://docs.gitlab.com/ee/ci/index.html).

Coolify includes Forgejo services with a single runner, using [Docker-in-Docker](https://hub.docker.com/_/docker) to handle and report task jobs.

Due to the alpha status of the Forgejo runner, rebooting the Forejo application container after the initial setup is required to fully register the shared secret into Forejo for runners to validate:

1. In the **Environment Variables** section of the service configuration, you may set as `RUNNER_SHARED_SECRET` a random 40-character hexagesimal string. The command `openssl rand -hex 20` creates something you can copy and paste.
2. After sucessfully setting up Forejo, **reboot the `forgejo` service** and wait some seconds until the runner appears in Forgejo *Actions* Configuration section.

Forejo is also compatible with third-party CI apps and platforms. Forgejo is a Gitea-fork, so instructions to incorporate these CI may be the same for both.

## Demo

* [Demo](https://next.forgejo.org/)

## Links

* [The official website](https://forgejo.org/)
* [Codeberg](https://codeberg.org/forgejo/forgejo)

---

---
url: /docs/services/formbricks.md
description: >-
  Run Formbricks surveys on Coolify for in-app feedback, NPS surveys, user
  research, and product experience analytics with no-code forms.
---

![Formbricks](https://github.com/formbricks/formbricks/assets/72809645/0086704f-bee7-4d38-9cc8-fa42ee59e004)

## What is Formbricks?

Formbricks provides a free and open source surveying platform. Gather feedback at every point in the user journey with beautiful in-app, website, link and email surveys. Build on top of Formbricks or leverage prebuilt data analysis capabilities.

## Screenshots

![Formbricks screenshot](https://camo.githubusercontent.com/e2c25e9b7c1fce99c6314379fb0341980f44529b2ae136956be878071bf8558b/68747470733a2f2f6769746875622d70726f64756374696f6e2d757365722d61737365742d3632313064662e73332e616d617a6f6e6177732e636f6d2f3637353036352f3234393434313936372d63636238396561332d383262342d346266322d386432632d3532383732316563333133622e706e67)

## Links

* [The official website](https://formbricks.com?utm_source=coolify.io)
* [GitHub](https://github.com/formbricks/formbricks?utm_source=coolify.io)

---

---
url: /docs/services/foundryvtt.md
description: >-
  Host Foundry VTT on Coolify for virtual tabletop RPG gaming with dynamic
  lighting, fog of war, character sheets, and immersive D&D sessions.
---

# Foundryvtt

## What is Foundryvtt

Foundry Virtual Tabletop is a self-hosted & modern roleplaying platform

## Links

* [Official Documentation](https://foundryvtt.com/kb/?utm_source=coolify.io)

---

---
url: /docs/services/freescout.md
description: >-
  Deploy FreeScout helpdesk on Coolify as self-hosted HelpScout alternative with
  shared inbox, ticketing, and customer support email management.
---

# Freescout

## What is Freescout

FreeScout is the super lightweight and powerful free open source help desk and shared inbox written in PHP (Laravel framework).

## Links

* [Official Documentation](https://github.com/freescout-help-desk/freescout/wiki/?utm_source=coolify.io)

---

---
url: /docs/services/freshrss.md
description: >-
  Run FreshRSS reader on Coolify for RSS/Atom feed aggregation, article reading,
  mobile apps integration, and news consumption with privacy.
---

# Freshrss

## What is Freshrss

A free, self-hostable feed aggregator.

## Deployment Variants

FreshRSS is available in four deployment configurations in Coolify:

### FreshRSS (Default)

* **Database:** SQLite (embedded)
* **Use case:** Simple deployments, testing, or personal RSS feed reading
* **Components:** Single FreshRSS container with built-in SQLite database

### FreshRSS with PostgreSQL

* **Database:** PostgreSQL
* **Use case:** Production deployments requiring better performance and scalability
* **Components:**
  * FreshRSS container
  * PostgreSQL container
  * Automatic database configuration and health checks

### FreshRSS with MySQL

* **Database:** MySQL
* **Use case:** Production deployments with MySQL preference
* **Components:**
  * FreshRSS container
  * MySQL container
  * Automatic database configuration and health checks

### FreshRSS with MariaDB

* **Database:** MariaDB
* **Use case:** Production deployments with MariaDB preference
* **Components:**
  * FreshRSS container
  * MariaDB container
  * Automatic database configuration and health checks

## Links

* [Official Documentation](https://freshrss.org/index.html?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/cloudflare/tunnels/full-tls.md
description: >-
  Configure end-to-end HTTPS for Coolify resources through Cloudflare Tunnels
  with Origin Certificates, strict TLS encryption, and proper domain setup.
---

# Full HTTPS/TLS Setup for All Resources

When tunneling resources with Coolify through Cloudflare, Cloudflare typically handles HTTPS and TLS termination, while Coolify runs your resources over HTTP.

This setup works for most users, but some may face issues with URL mismatches, especially for apps that require HTTPS on Coolify to issue JWT tokens or handle callback URLs.

This guide solves that issue by configuring your resources to run fully on HTTPS, bypassing Cloudflare's HTTPS handling and ensuring your app functions correctly with secure connections.

## Who this is for?

This guide is ideal for users who:

* Have followed our [Tunnel All Resources Using Cloudflare Tunnel](/knowledge-base/cloudflare/tunnels/all-resource) or [Tunnel Specific Resources Using Cloudflare Tunnel](/knowledge-base/cloudflare/tunnels/single-resource) guide.
* Need their resources deployed with Coolify to run on HTTPS for applications requiring HTTPS for JWT issuance, callback functions, or similar features.

## Setup Requirements

To follow this guide, you'll need:

* A working Cloudflare tunnel setup as described in the previous guides.
* A domain configured in Cloudflare to handle HTTP traffic and redirect to HTTPS.

## Before We Start

* If your Coolify instance is on the same tunnel as the domain you want to configure, make sure you can access the Coolify Dashboard using the server IP and port (e.g., **203.0.113.1:8000**) before starting these steps.
* The default port is **8000**, but if youâ€™ve changed or disabled it, ensure you can access the Coolify Dashboard through the new port or that port **8000** is re-enabled on the server.

***

### Quick Links to Important Sections:

* [Create a Cloudflare Origin Certificate](#_1-create-a-cloudflare-origin-certificate)
* [Add Origin Certificate to Your Server](#_2-add-origin-certificate-to-your-server)
* [Configure Coolify to Use the Origin Certificate](#_3-configure-coolify-to-use-the-origin-certificate)
* [Setup Encryption mode on Cloudflare](#_4-setup-encryption-mode-on-cloudflare)
* [Configure Tunnel to Use HTTPS](#_5-configure-tunnel-to-use-https)
* [Configure Cloudflare to Always Use HTTPS](#_6-configure-cloudflare-to-always-use-https)
* [Update URLs from HTTP to HTTPS](#_7-update-urls-from-http-to-https)

***

::: warning Example Data
The following data is used as an example in this guide. Please replace it with your actual data when following the steps:

* **IPv4 Address of Origin Server:** 203.0.113.1
* **Domain Name:** shadowarcanist.com
* **Username:** shadowarcanist
  :::

## 1. Create a Cloudflare Origin Certificate

To create your Cloudflare Origin Certificate, follow these steps:

1. In your Cloudflare dashboard, go to **SSL/TLS**.
2. Select **Origin Server**.
3. Click the **Create Certificate** button.

Youâ€™ll be asked to choose a private key type, hostnames, and certificate validity.

1. Choose **RSA (2048)** for the key type.
2. Add the hostnames you want the certificate to cover.

::: warning HEADS UP!

* **`shadowarcanist.com`** will cover only the main domain.
* **`*.shadowarcanist.com`** will cover all subdomains.

On Cloudflareâ€™s free plan, wildcard certificates cover just one level of subdomains

For example, it works for **`coolify.shadowarcanist.com`** but not **`www.coolify.shadowarcanist.com`**.

To cover multiple levels, you'll need to purchase the [Advanced Certificate Manager](https://www.cloudflare.com/application-services/products/advanced-certificate-manager/)
:::

3. Set the certificate validity to **15 years**.

Your certificate will now be generated.

1. Choose **PEM** as the key format.
2. Copy your **Certificate**.
3. Copy your **Private Key**.

Next, you'll add these to your server running Coolify and configure Coolify to use this certificate.

## 2. Add Origin Certificate to Your Server

SSH into your server or use Coolify's terminal feature. For this guide, Iâ€™m using SSH:

```sh
ssh shadowarcanist@203.0.113.1
```

Once logged in, navigate to the Coolify proxy directory:

```sh
cd /data/coolify/proxy
```

Check if you have a **certs** folder:

```sh
ls
> acme.json  docker-compose.yml  dynamic
```

If thereâ€™s no **certs** folder, create it:

```sh
mkdir certs
```

Verify it was created:

```sh
ls
> acme.json  certs docker-compose.yml  dynamic
```

Now, navigate into the **certs** directory:

```sh
cd certs
```

Create two new files for the certificate and private key:

```sh
touch shadowarcanist.cert shadowarcanist.key
```

Verify the files were created:

```sh
ls
> shadowarcanist.cert shadowarcanist.key
```

Open the **shadowarcanist.cert** file and paste the certificate from the Cloudflare dashboard:

```sh
nano shadowarcanist.cert
```

Save and exit after pasting the certificate.

Do the same for the **shadowarcanist.key** file and paste the private key:

```sh
nano shadowarcanist.key
```

Save and exit.

Now the origin certificate is installed on your server.

## 3. Configure Coolify to Use the Origin Certificate

Now, in your Coolify dashboard:

1. Go to the **Server** section in the sidebar.
2. Select **Proxy**.
3. Open the **Dynamic Configuration** page
4. Click **Add** button

You will now be prompted to enter the Dynamic Configuration.

1. Choose a name for your configuration.
2. Enter the following details in the configuration field:

```yaml
tls:
  certificates:
    - certFile: /traefik/certs/shadowarcanist.cert
      keyFile: /traefik/certs/shadowarcanist.key
```

::: details Adding Multiple Certificates (click to view)

```yaml
tls:
  certificates:
    - certFile: /traefik/certs/shadowarcanist.cert
      keyFile: /traefik/certs/shadowarcanist.key
    - certFile: /traefik/certs/name2.cert
      keyFile: /traefik/certs/name2.key
    - certFile: /traefik/certs/name3.cert
      keyFile: /traefik/certs/name3.key
```

:::

3. Save the configuration

From now on, Coolify will use the origin certificate for requests matching the hostname.

## 4. Setup Encryption mode on Cloudflare

To set up encryption on Cloudflare, follow these steps:

1. Go to **SSL/TLS** in Cloudflare.
2. Select **Overview**.
3. Click **Configure** button

Choose **Full (Strict)** as the encryption mode.

## 5. Configure Tunnel to Use HTTPS

To configure the tunnel for HTTPS, follow these steps:

1. Click the three dots icon to open the settings menu.
2. Select **Edit** to allow hostname modifications.

Next, update the hostnames as follows:

1. Change the type from **HTTP** to **HTTPS**.
2. Change the port from **80** to **443**.

3) Click on **Additional Application Settings**.
4) Select **TLS**.
5) Enter your root domain in the **Origin Server Name** field.
6) Scroll down and click the **Save Hostname** button.

## 6. Configure Cloudflare to Always Use HTTPS

1. In the Cloudflare dashboard, go to **SSL/TLS**.
2. Select **Edge Certificates**.
3. Enable **Always Use HTTPS**.

## 7. Update URLs from HTTP to HTTPS

Now, update all URLs from **HTTP** to **HTTPS** in Coolify, including resources and the instance domain on the settings page.

**Congratulations!** All your resources are now running on HTTPS at all times.

---

---
url: /docs/troubleshoot/applications/gateway-timeout.md
description: >-
  Resolve Gateway Timeout (504) errors in Coolify by fixing network isolation,
  adjusting proxy timeouts for Traefik, Caddy, and Nginx.
---

# Gateway Timeout (504) Errors

Gateway timeout errors occur when the Coolify proxy cannot get a response from your application within the configured timeout period. This is different from [Bad Gateway (502)](/troubleshoot/applications/bad-gateway#bad-gateway-502-error) errors, which indicate the proxy cannot connect to your application at all.

## Common Causes

There are two primary scenarios that cause 504 Gateway Timeout errors in Coolify:

1. **Custom Docker Network Isolation** - The proxy cannot reach applications using custom networks
2. **Large Upload/Download Timeouts** - Default timeout settings are too short for large file transfers

## Issue 1: Custom Docker Network Isolation

### Symptoms

* Application works initially after deployment
* 504 Gateway Timeout errors appear after hours or days
* Application is reachable via direct IP and port (requires manual port mapping)
* Restarting the application temporarily fixes the issue
* Using custom Docker networks in your configuration

### Root Cause

When you define custom Docker networks in your Docker Compose file, the `coolify-proxy` container runs in Coolify's own networks while your application runs in the custom network. This network isolation prevents the proxy from reaching your application, especially when Docker's internal DNS returns different IPs based on timing and network joins.

### Diagnosis

1. **Check if your application uses custom networks:**

   ```bash
   docker inspect <your-container-name> --format='{{range $k,$v := .NetworkSettings.Networks}}Network: {{$k}}, IP: {{$v.IPAddress}}, Gateway: {{$v.Gateway}}{{println}}{{end}}'
   ```

2. **Verify proxy network connections:**

   ```bash
   docker inspect coolify-proxy --format='{{range $k,$v := .NetworkSettings.Networks}}Network: {{$k}}, IP: {{$v.IPAddress}}, Gateway: {{$v.Gateway}}{{println}}{{end}}'
   ```

### Solutions

#### Solution 1: Use Coolify Destinations (Recommended)

Let Coolify manage networks automatically by using [Destinations](/knowledge-base/destinations/) instead of custom networks:

1. Remove custom network definitions from your Docker Compose file
2. [Configure the network destination](/knowledge-base/destinations/create) in Coolify's UI under **Destinations**
3. [Move your application / service to the desired destination](/knowledge-base/destinations/manage#assign-resources-to-a-destination)
4. Redeploy

**Before (problematic):**

```yaml
services:
  app:
    image: myapp:latest
    networks:
      - custom-network

networks:
  custom-network:
    driver: bridge
```

**After (recommended):**

```yaml
services:
  app:
    image: myapp:latest
    # Let Coolify handle networking
```

#### Solution 2: Manual Network Connection (Temporary)

If you must use custom networks, manually connect the proxy:

```bash
docker network connect <your-network-name> coolify-proxy
```

**Note:** This is a temporary fix that may need to be reapplied after proxy restarts.

## Issue 2: Large Upload/Download Timeouts

### Symptoms

* 504 errors when uploading large files (>100MB)
* 504 errors when pushing large Docker images to a registry
* 504 errors during long-running requests (>60 seconds for Traefik/Nginx)
* Small files and quick requests work fine

### Root Cause

The default timeout behavior depends on your proxy:

* **Traefik**: Default read timeout is 60 seconds
* **Caddy**: No default timeout (requests can run indefinitely)
* **Nginx** (one-click databases): Default timeout is 60 seconds

Any request exceeding the configured timeout will result in a 504 Gateway Timeout error, even if the backend application is still processing the request.

### Diagnosis

1. **Check which proxy you're using:**

   * Navigate to **Servers > \[YourServer] > Proxy** in the Coolify UI
   * The proxy type (Traefik, Caddy, etc.) will be displayed

2. **Check current proxy configuration:**

   * Navigate to **Servers > \[YourServer] > Proxy** and look for any timeout settings
   * Check your applications / services for custom labels that might override defaults

3. **Monitor request duration in application logs:**

   * Navigate to your application / service logs in Coolify
   * Look for long-running requests that exceed 60 seconds

4. **Test with a smaller file to confirm it's size-related**

### Solutions

#### Solution 1: Increase Proxy Timeout

The configuration method depends on your proxy type:

##### For Traefik (Default Proxy)

Add custom Traefik configuration to increase the timeout. You have various options depending on your needs to achieve this:

Navigate to your server's proxy settings and add the new timeouts under the command section:

```yaml
command:
  - "--entrypoints.https.transport.respondingTimeouts.readTimeout=5m"
  - "--entrypoints.https.transport.respondingTimeouts.writeTimeout=5m"
  - "--entrypoints.https.transport.respondingTimeouts.idleTimeout=5m"
```

Read more about Traefik timeouts in the [official documentation](https://doc.traefik.io/traefik/reference/install-configuration/entrypoints/#timeout).

##### For Caddy

Since Caddy has no default timeout, you typically won't experience timeout issues. However, if you need to SET a timeout (for security or resource management):

1. Add the following to your **Container Labels** in Coolify:

```yaml
# Set a 5-minute timeout (300 seconds)
caddy.servers.timeouts.read_body=300s
caddy.servers.timeouts.read_header=300s
caddy.servers.timeouts.write=300s
caddy.servers.timeouts.idle=5m
```

Read more about Caddy timeouts in the [official documentation](https://caddyserver.com/docs/caddyfile/options#timeouts).

##### For Nginx (One-Click Databases)

Nginx configuration cannot be directly modified for one-click databases in Coolify. Instead, **bypass Nginx entirely** to avoid timeout issues:

1. Navigate to your database settings in Coolify
2. **Disable** "Make it publicly available?" option
3. Use **Port Mappings** instead to expose the database port directly and restart the database
4. This maps the port directly from the container, bypassing Nginx and its timeout limitations

**Example:** For a PostgreSQL database, map port `5432:5432` to access it directly without any proxy timeouts.

Read more about public database access here: [One-Click Databases](/databases/#ports-mapping-vs-public-port).

#### Solution 2: Implement Chunked Uploads

For very large files, consider implementing chunked uploads in your application:

1. Split large files into smaller chunks on the client side
2. Upload chunks individually (each under the timeout limit)
3. Reassemble on the server side

#### Solution 3: Use Background Processing

For long-running operations:

1. Accept the request and return immediately with a job ID
2. Process the request in the background
3. Provide an endpoint to check job status

## Quick Diagnosis Checklist

Run through these steps to identify your specific issue:

1. **Check the error code:**

   * 504 = Gateway Timeout (this guide)
   * 502 = Bad Gateway (see [Bad Gateway troubleshooting](/troubleshoot/applications/bad-gateway))

2. **Check timing:**

   * Immediate = likely network/configuration issue
   * After ~60 seconds = likely timeout issue
   * Random after hours/days = likely network isolation issue

3. **Check network configuration:**

   ```bash
   # List all Docker networks
   docker network ls

   # Check which networks your containers are using
   docker ps --format "table {{.Names}}\t{{.Networks}}"
   ```

## Prevention Tips

1. **Avoid custom Docker networks** unless absolutely necessary
2. **Set appropriate timeouts** for your application's needs during initial setup
3. **Implement health checks** to maintain connectivity
4. **Monitor proxy logs** regularly for timeout patterns
5. **Use progress indicators** for long-running operations to prevent client-side timeouts

## Support

If these solutions don't resolve your gateway timeout issues:

1. Collect diagnostic information:

   ```bash
   # Save this output
   docker ps --format "table {{.Names}}\t{{.Networks}}\t{{.Status}}"
   docker logs coolify-proxy --tail 200 > proxy-logs.txt
   docker logs <your-container-name> --tail 200 > app-logs.txt
   ```

2. Join our [Discord Community](https://coolify.io/discord)

3. Share your configuration, logs, and the specific steps you've tried

---

---
url: /docs/services/ghost.md
description: >-
  Deploy Ghost publishing platform on Coolify for professional blogs,
  newsletters, memberships, and content monetization with modern editor.
---

![Ghost](https://user-images.githubusercontent.com/353959/169805900-66be5b89-0859-4816-8da9-528ed7534704.png)

## What is Ghost?

Ghost is a powerful app for professional publishers to create, share, and grow a business around their content. It comes with modern tools to build a website, publish content, send newsletters & offer paid subscriptions to members.

## Links

* [The official website](https://ghost.org/)
* [GitHub](https://github.com/TryGhost/Ghost)

---

---
url: /docs/services/gitea.md
description: >-
  Host Gitea Git service on Coolify for lightweight repository hosting with pull
  requests, CI/CD integration, issues, and team collaboration.
---

![Gitea](https://about.gitea.com/gitea-text.svg)

## What is Gitea?

Git with a cup of tea! Painless self-hosted all-in-one software development service, including Git hosting, code review, team collaboration, package registry and CI/CD.

## Deployment Variants

Gitea is available in four deployment configurations in Coolify:

### Gitea (Default)

* **Database:** SQLite (embedded)
* **Use case:** Simple deployments, personal projects, or testing
* **Components:** Single Gitea container with built-in SQLite database

### Gitea with PostgreSQL

* **Database:** PostgreSQL
* **Use case:** Production deployments requiring PostgreSQL compatibility and better performance
* **Components:**
  * Gitea container
  * PostgreSQL 16 container
  * Automatic database configuration and health checks

### Gitea with MySQL

* **Database:** MySQL
* **Use case:** Production deployments with MySQL preference
* **Components:**
  * Gitea container
  * MySQL container
  * Automatic database configuration and health checks

### Gitea with MariaDB

* **Database:** MariaDB
* **Use case:** Production deployments with MariaDB preference
* **Components:**
  * Gitea container
  * MariaDB container
  * Automatic database configuration and health checks

## Demo

* [Demo](https://try.gitea.io/)

## Links

* [The official website](https://gitea.com)
* [GitHub](https://github.com/go-gitea/gitea)

---

---
url: /docs/applications/ci-cd/github/github-actions.md
description: >-
  Build and deploy Docker images to Coolify using GitHub Actions workflows with
  registry integration, API tokens, and automated webhook triggers.
---

# GitHub Actions

You can use GitHub Actions to build your image and deploy it to Coolify.

Here is an [example repository](https://github.com/andrasbacsai/github-actions-with-coolify) and a [workflow file](https://github.com/andrasbacsai/github-actions-with-coolify/blob/main/.github/workflows/build.yaml) that you can check how it works.

## Process Overview

1. You need to create a [GitHub Action workflow](https://github.com/andrasbacsai/github-actions-with-coolify/blob/main/.github/workflows/build.yaml) file in your repository.

2. You need to build your image and push it to a Docker registry. In the example, I use ghcr.io, but you can use any other registry.

3. You need to create a [Coolify API Token](/api-reference/authorization) and add it to your GitHub repository secrets.
   * `COOLIFY_TOKEN` in the example.

4. In Coolify, you need to setup your deployment type. It could be a simple Dockerfile, Docker Compose or Docker Image based deployment.

5. Get the proper webhook endpoint from Coolify (Your resource / `Webhook` menu) and add it to your GitHub repository secrets.
   * `COOLIFY_WEBHOOK` in the example.

6. Need to send a GET request to that webhook endpoint (authenticated with the token) to trigger the deployment
   ```bash
   curl --request GET "${% raw %}{{ secrets.COOLIFY_WEBHOOK }}{% endraw %}" --header "Authorization: Bearer ${% raw %}{{ secrets.COOLIFY_TOKEN }}{% endraw %}"
   ```

7. That's it! Now you can push to your repository and the deployment will be triggered automatically.

---

---
url: /docs/services/github-runner.md
description: >-
  Run self-hosted GitHub Actions runner on Coolify for CI/CD workflows, private
  infrastructure builds, and automated deployment pipelines.
---

# GitHub Runner

## What is GitHub Runner?

GitHub Runner is a self-hosted runner for GitHub Actions that allows you to run CI/CD workflows on your own infrastructure. This Docker-based solution provides more control over the execution environment, better security for private repositories, and can be more cost-effective for heavy workloads. It supports running workflows for multiple repositories and organizations.

## Links

* [The official GitHub Actions documentation](https://docs.github.com/en/actions/hosting-your-own-runners?utm_source=coolify.io)
* [GitHub](https://github.com/myoung34/docker-github-actions-runner?utm_source=coolify.io)

---

---
url: /docs/services/gitlab.md
description: >-
  Deploy GitLab on Coolify for complete DevOps platform with Git repos, CI/CD
  pipelines, issue tracking, and container registry integration.
---

![Gitlab](https://raw.githubusercontent.com/gitlabhq/gitlabhq/refs/heads/master/public/apple-touch-icon.png)

## What is GitLab?

GitLab is a web-based DevOps lifecycle tool that provides a Git-repository manager providing wiki, issue-tracking and CI/CD pipeline features, powered by Ruby on Rails framework.

## Demo

* [Demo](https://gitlab.com/)

## Links

* [The official website](https://about.gitlab.com)
* [GitLab](https://gitlab.com/gitlab-org/gitlab)

---

---
url: /docs/services/glance.md
description: >-
  Host Glance dashboard on Coolify for quick server overview, system monitoring,
  service status, and at-a-glance infrastructure health display.
---

# Glance

A self-hosted dashboard that puts all your feeds in one place.

## Screenshots

![Glance UI](https://raw.githubusercontent.com/glanceapp/glance/main/docs/images/readme-main-image.png)

## Links

* [The official website](https://github.com/glanceapp/glance)

---

---
url: /docs/services/glances.md
description: >-
  Monitor system performance on Coolify with Glances showing CPU, memory, disk,
  network stats, and process monitoring via web interface.
---

![Glances](https://raw.githubusercontent.com/nicolargo/glances/develop/docs/_static/glances-responsive-webdesign.png)

## What is Glances?

Glances is a cross-platform monitoring tool which aims to provide a simple yet efficient and straightforward way to access and display system information.

## Links

* [The official website](https://nicolargo.github.io/glances/)
* [GitHub](https://github.com/nicolargo/glances)

---

---
url: /docs/services/glitchtip.md
description: >-
  Deploy GlitchTip error tracking on Coolify as open-source Sentry alternative
  for exception monitoring, performance tracking, and debugging.
---

![Glitchtip](https://glitchtip.com/assets/logo-again.svg)

## What is Glitchtip?

Track errors, uptime, and performance. An open source reimplementation of Sentry error tracking platform.

## Links

* [The official website](https://glitchtip.com/)
* [GitHub](https://gitlab.com/glitchtip)

---

---
url: /docs/services/gotenberg.md
description: >-
  Run Gotenberg on Coolify for PDF generation from HTML, Markdown, Office files
  via Docker-based microservice with REST API for conversions.
---

![Gotenberg](https://user-images.githubusercontent.com/8983173/130322857-185831e2-f041-46eb-a17f-0a69d066c4e5.png)

## What is Gotenberg?

Gotenberg provides a developer-friendly API to interact with powerful tools like Chromium and LibreOffice
for converting numerous document formats (HTML, Markdown, Word, Excel, etc.) into PDF files, and more!

Gotenberg **has no UI**. Head to the [documentation](https://gotenberg.dev/docs/getting-started/introduction) to learn how to interact with it ðŸš€.

## Links

* [Official Website](https://gotenberg.dev)
* [GitHub](https://github.com/gotenberg/gotenberg)

---

---
url: /docs/services/gotify.md
description: >-
  Deploy Gotify on Coolify for self-hosted push notifications, real-time
  messaging, REST API integration, and Android/iOS notification delivery.
---

## What is Gotify?

Gotify is a simple server for sending and receiving messages in real-time per WebSocket. It includes a sleek web UI for managing notifications and provides complete control over your notification data.

## Features

* **Self-Hosted & Privacy-Focused:** Complete control over your data with no reliance on third-party services
* **REST API:** Send messages through a simple and powerful REST API
* **WebSocket:** Receive messages in real-time using WebSocket connections
* **Cross-Platform:** Written in Go, works on multiple platforms including Docker
* **Android & iOS Support:** Native mobile apps available for push notifications
* **User Management:** Manage multiple users, clients, and applications
* **Lightweight:** Efficient server that doesn't consume excessive resources
* **Open Source:** MIT licensed and community-maintained
* **Easy Integration:** Simple API makes it easy to integrate with existing applications and services

## Use Cases

Perfect for receiving notifications from:

* Monitoring systems and alerts
* CI/CD pipelines
* Home automation services
* Custom scripts and applications
* Server and application monitoring
* Backup notifications

## Screenshots

## Links

* [The official website](https://gotify.net/)
* [GitHub](https://github.com/gotify/server)
* [Documentation](https://gotify.net/docs/)
* [Android App (Google Play)](https://play.google.com/store/apps/details?id=com.github.gotify)
* [Android App (F-Droid)](https://f-droid.org/de/packages/com.github.gotify/)

---

---
url: /docs/services/gowa.md
description: >-
  Host Gowa analytics on Coolify for website traffic tracking, visitor insights,
  and privacy-respecting web analytics without cookies or tracking.
---

# GoWa

## What is GoWa?

GoWa (Golang WhatsApp) is a WhatsApp Web API service built with Go for efficient memory usage and performance. It provides multi-device support and allows you to integrate WhatsApp functionality into your applications through a REST API. GoWa is designed to be lightweight and scalable, making it ideal for businesses that need WhatsApp automation and integration capabilities.

## Links

* [GitHub](https://github.com/aldinokemal/go-whatsapp-web-multidevice?utm_source=coolify.io)

---

---
url: /docs/services/grafana.md
description: >-
  Deploy Grafana on Coolify for data visualization, monitoring dashboards,
  alerting, and metric analysis from multiple data sources and databases.
---

![Grafana](https://github.com/grafana/grafana/raw/main/docs/logo-horizontal.png#gh-light-mode-only)

## What is Grafana?

The open and composable observability and data visualization platform. Visualize metrics, logs, and traces from multiple sources like Prometheus, Loki, Elasticsearch, InfluxDB, Postgres and many more.

## Deployment Variants

Grafana is available in two deployment configurations in Coolify:

### Grafana (Default)

* **Database:** Embedded (SQLite)
* **Use case:** Simple monitoring setups, testing, or temporary dashboards
* **Components:** Single Grafana container with built-in database

### Grafana with PostgreSQL

* **Database:** PostgreSQL
* **Use case:** Production deployments requiring persistent data storage, high availability, and better performance
* **Components:**
  * Grafana container
  * PostgreSQL 16 container
  * Automatic database configuration and health checks

## Features

Grafana allows you to query, visualize, alert on and understand your metrics no matter where they are stored. Create, explore, and share dashboards with your team and foster a data-driven culture:

* **Visualizations:** Fast and flexible client side graphs with a multitude of options. Panel plugins offer many different ways to visualize metrics and logs.
* **Dynamic Dashboards:** Create dynamic & reusable dashboards with template variables that appear as dropdowns at the top of the dashboard.
* **Explore Metrics:** Explore your data through ad-hoc queries and dynamic drilldown. Split view and compare different time ranges, queries and data sources side by side.
* **Explore Logs:** Experience the magic of switching from metrics to logs with preserved label filters. Quickly search through all your logs or streaming them live.
* **Alerting:** Visually define alert rules for your most important metrics. Grafana will continuously evaluate and send notifications to systems like Slack, PagerDuty, VictorOps, OpsGenie.
* **Mixed Data Sources:** Mix different data sources in the same graph! You can specify a data source on a per-query basis. This works for even custom datasources.

## Links

* [The official website](https://grafana.com/)
* [GitHub](https://github.com/grafana/grafana)

---

---
url: /docs/services/gramps-web.md
description: Deploy Gramps Web genealogy system on Coolify for building your family tree.
---

# Gramps Web

![Gramps Web logo](/images/services/grampsweb-logo.svg){ width=64px }

## What is Gramps Web?

The free, open-source genealogy system for building your family tree â€“ together. Use it standalone
or as a companion to Gramps Desktop, with full control over your data and privacy as the top priority.

## Screenshots

## Links

* [Official website](https://www.grampsweb.org/?utm_source=coolify.io)
* [GitHub](https://github.com/gramps-project/gramps-web?utm_source=coolify.io)

---

---
url: /docs/services/grist.md
description: >-
  Run Grist spreadsheet on Coolify combining spreadsheets and databases with
  relational data, forms, automation, and collaborative data management.
---

## What is Grist?

Grist is a modern relational spreadsheet. It combines the flexibility of a spreadsheet with the robustness of a database.

## Links

* [The official website](https://getgrist.com/?utm_source=coolify.io)
* [GitHub](https://github.com/gristlabs/grist-core?utm_source=coolify.io)

---

---
url: /docs/services/grocy.md
description: >-
  Manage household on Coolify with Grocy for grocery inventory, recipe
  management, chore tracking, and smart shopping lists for home organization.
---

![Grocy](https://raw.githubusercontent.com/grocy/grocy/master/public/img/logo.svg?sanitize=true)

## What is Grocy?

Grocy is a web-based self-hosted groceries & household management solution for your home.
After installation your default credentials will be username: `admin`, password: `admin`.
Make sure to update these ASAP by logging in and editing the `admin` user in the settings, which can be found in the top right of your screen.

## Links

* [The official website](https://grocy.info)
* [GitHub](https://github.com/grocy/grocy)

---

---
url: /docs/knowledge-base/health-checks.md
description: >-
  Configure application health checks in Coolify with Dockerfile or UI settings
  for Traefik routing, rolling updates, and troubleshooting 404 errors.
---

# Health checks

Health checks are a way to ensure that your applications and services are running correctly. They allow Coolify to monitor the health of your resources and ensure that traffic is only routed to healthy instances. This for example important for [Rolling Updates](/knowledge-base/rolling-updates) to work correctly.

## Traefik

When using Traefik as the reverse proxy, health checks are an integral part of how it routes traffic to your resources.

### Enabled

If your resource has health checks *enabled*, Traefik will only route traffic to it if the health check passes. If the health check fails, Traefik will not route traffic to the resource.

**It will cause the resource to return a `404 Not Found` or `No available server` error.**

::: tip Troubleshooting Failed Health Checks
If you're experiencing "No available server" errors, check our comprehensive [troubleshooting guide](/troubleshoot/applications/no-available-server) which covers the most common causes and solutions.
:::

### Disabled

If your resource has health checks *disabled*, Traefik will route traffic to it regardless of the health check status.

## Configure Health checks

### Applications

There are two ways to configure health checks for your applications:

1. **Using the UI**: You can set up health checks directly in the Coolify UI when creating or editing an application. You can specify the path to check, the expected response code, and the interval for checking. It will be required that the container has either `curl` or `wget` installed to perform the health checks.

2. **Using the Dockerfile**: You can also define health checks in your Dockerfile using the [HEALTHCHECK](https://docs.docker.com/reference/dockerfile/#healthcheck) instruction. This allows you to specify how the health check should be performed, including the command to run and the expected response.

If there are healthchecks both in the UI and in the Dockerfile defined and enabled, the Dockerfile will take precedence.

### Service Stacks

Services or Applications that use the [Docker Compose Build Pack](/applications/build-packs/docker-compose) require their health checks to be defined in the `Dockerfile` of each service, or in their `docker-compose.y[a]ml` file using the [healthcheck](https://docs.docker.com/reference/compose-file/services/#healthcheck) attribute.

::: tip When to use health checks?
It is recommended to enable health checks for all your resources. This way, you can ensure that only healthy resources are receiving traffic.

But if you cannot set up health checks for some reason, you can disable them.

Just be aware that if the resource is unhealthy, it will still receive traffic.
:::

---

---
url: /docs/services/heimdall.md
description: >-
  Deploy Heimdall dashboard on Coolify for application launcher, bookmark
  manager, and organized access point to all your self-hosted services.
---

![Heimdall](https://camo.githubusercontent.com/0b7b7b9940d2234a4edc1af41c191c62b716baf21a0803a38b0cc9d5328db54e/68747470733a2f2f692e696d6775722e636f6d2f697556387733792e706e67)

## What is Heimdall?

As the name suggests Heimdall Application Dashboard is a dashboard for all your web applications. It doesn't need to be limited to applications though, you can add links to anything you like.

Heimdall is an elegant solution to organise all your web applications. Itâ€™s dedicated to this purpose so you wonâ€™t lose your links in a sea of bookmarks.

Why not use it as your browser start page? It even has the ability to include a search bar using either Google, Bing or DuckDuckGo.

## Screenshots

![Heimdall Preview](https://camo.githubusercontent.com/b07301664bb1779167d39c07c193d0974e51ae99be153b45cf310285f87a4371/68747470733a2f2f692e696d6775722e636f6d2f4d72433451704e2e676966)

## Links

* [The official website](https://heimdall.site/)
* [GitHub](https://github.com/linuxserver/Heimdall)

---

---
url: /docs/services/heyform.md
description: >-
  Build forms on Coolify with HeyForm featuring conversational forms,
  conditional logic, integrations, and beautiful form experiences without
  coding.
---

# Heyform

## What is Heyform

Allows anyone to create engaging conversational forms for surveys, questionnaires, quizzes, and polls. No coding skills required.

## Links

* [Official Documentation](https://docs.heyform.net/open-source/self-hosting?utm_source=coolify.io)

---

---
url: /docs/services/hoarder.md
description: >-
  Host Hoarder bookmark manager on Coolify for saving links, organizing
  collections, tagging, and personal knowledge management with search.
---

::: warning SERVICE NOT AVAILABLE
This service is currently not available in Coolify's service catalog.
:::

# Hoarder

## What is Hoarder

an open source "Bookmark Everything" app that uses AI for automatically tagging the content you throw at it.

## Links

* [Official Documentation](https://docs.hoarder.app/?utm_source=coolify.io)

---

---
url: /docs/services/homarr.md
description: >-
  Run Homarr dashboard on Coolify for service management, monitoring, quick
  access, widgets, and customizable homepage for self-hosted applications.
---

# Homarr

## What is Homarr

Homarr is a self-hosted homepage for your services.

## Links

* [Official Documentation](https://homarr.dev?utm_source=coolify.io)

---

---
url: /docs/services/home-assistant.md
description: >-
  Run Home Assistant on Coolifyâ€”your open-source home automation platform with
  integrations for hundreds of devices.
---

# Home Assistant

## What is Home Assistant?

Home Assistant is an openâ€‘source home automation platform focused on local control and privacy. It connects lights, sensors, cameras, media players, and moreâ€”so you can automate routines, build dashboards, and control everything from a single place.

## Features

* **1,000+ Integrations**: Support for thousands of smart home devices and services
* **Local Control**: Runs privately in your environment without cloud dependencies
* **Powerful Automations**: Create complex routines with YAML configuration or visual UI
* **Multi-Platform Access**: Mobile apps, web dashboards, voice control, and remote access
* **Privacy-Focused**: Your data stays on your server with no tracking or telemetry
* **Extensible**: Add-ons, custom integrations, and active community support

## Links

* [Official Website](https://www.home-assistant.io/?utm_source=coolify.io)
* [Documentation](https://www.home-assistant.io/docs/?utm_source=coolify.io)
* [GitHub](https://github.com/home-assistant/core?utm_source=coolify.io)
* [Community Forums](https://community.home-assistant.io/?utm_source=coolify.io)

---

---
url: /docs/services/homebox.md
description: >-
  Manage home inventory on Coolify with Homebox for asset tracking, warranty
  management, location organization, and household item cataloging.
---

# Homebox

## What is Homebox?

Homebox is an inventory and organization system built specifically for home users. It allows you to catalog and track your belongings, create locations and categories, manage warranties and receipts, and keep detailed records of your household items. Homebox is perfect for insurance purposes, organizing collections, and general home inventory management with features like photo attachments, search functionality, and reporting capabilities.

## Configuration

In order to create your first account you will have to head to the environment variables for Homebox and set `HBOX_OPTIONS_ALLOW_REGISTRATION` to true and restart your docker for the change to take effect.
You are now able to create your first account, after which you can set `HBOX_OPTIONS_ALLOW_REGISTRATION` to false again to prevent new registrations, or keep them opened for other users to join your homebox.

## Links

* [GitHub](https://github.com/hay-kot/homebox?utm_source=coolify.io)

---

---
url: /docs/services/homepage.md
description: >-
  Deploy Homepage dashboard on Coolify for service bookmarks, status monitoring,
  widgets integration, and organized homepage for self-hosted tools.
---

![Homepage](https://gethomepage.dev/assets/banner_light@2x.webp)

## What is Homepage?

A modern, fully static, fast, secure fully proxied, highly customizable application dashboard

## Screenshots

![Homepage Preview](https://gethomepage.dev/assets/homepage_demo_clip.webp)

## Links

* [The official website](https://gethomepage.dev/latest/)

---

---
url: /docs/services/hoppscotch.md
description: >-
  Run Hoppscotch API testing on Coolify as open-source Postman alternative with
  REST, GraphQL, WebSocket testing, and API development tools.
---

# Hoppscotch

## What is Hoppscotch

The Open Source API Development Platform

## Links

* [Official Documentation](https://docs.hoppscotch.io?utm_source=coolify.io)

---

---
url: /docs/services/immich.md
description: >-
  Host Immich photo management on Coolify for Google Photos alternative with
  mobile backup, ML-powered search, face recognition, and sharing.
---

# Immich

## What is Immich

Self-hosted photo and video management solution.

## Links

* [Official Documentation](https://immich.app/docs/overview/introduction?utm_source=coolify.io)

---

---
url: /docs/services/infisical.md
description: >-
  Deploy Infisical secrets management on Coolify for environment variables, API
  keys, secure sharing, and centralized secrets across development teams.
---

## What is Infisical?

Infisical is the open source security infrastructure platform that engineers use for secrets management, internal PKI, key management, and SSH workflow orchestration.

* Secrets Management: Infisical's secrets management module lets developers centralize and securely manage application configuration, API keys, database credentials, and other sensitive data.
* Public Key Infrastructure (PKI): Infisical PKI lets you operate an internal certificate authority and manage the full X.509 certificate lifecycle for services, applications, and devices.
* Key Management System (KMS): Infisical KMS helps you generate and securely manage encryption keys to encrypt/decrypt data.
* SSH Certificate Management: Infisical SSH lets you provision engineers short-lived, secure SSH access to infrastructure by replacing traditional static SSH keys with ephemeral certificate-based authentication.

## Screenshots

## Links

* [The official website](https://infisical.com/?utm_source=coolify.io)
* [GitHub](https://github.com/Infisical/infisical?utm_source=coolify.io)

---

---
url: /docs/get-started/installation.md
description: >-
  Install Coolify self-hosted PaaS on Linux servers with automated Docker setup
  script, manual configuration, SSH access, and firewall setup.
---

If you decide to go with **Coolify Cloud**, there's no installation required. Simply visit [Coolify Cloud Registration](https://app.coolify.io/register) to create an account and start using Coolify within minutes!

Below, you'll find instructions for installing Coolify if you prefer to **self-host** it.

## Self-hosted Installation

If you like taking control and managing everything yourself, self-hosting Coolify is the way to go.

It's completely free (apart from your server costs) and gives you full control over your setup.

::: success âš¡ï¸ Quick Installation (recommended):

```sh
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
```

Run this script in your terminal, and Coolify will be installed automatically. For more details, including firewall configuration and prerequisites, check out the guide below.

:::

::: warning Note for Ubuntu Users:
The automatic installation script only works with Ubuntu LTS versions (20.04, 22.04, 24.04). If you're using a non-LTS version (e.g., 24.10), please use the [Manual Installation](#manual-installation) method below.
:::

## Before You Begin

Before installing Coolify, make sure your server meets the necessary requirements.

### 1. Server Requirements

You need a server with SSH access. This could be:

* A VPS (Virtual Private Server)
* A Dedicated Server
* A Virtual Machine (VM)
* A Raspberry Pi (see our [Raspberry Pi OS Setup Guide](/knowledge-base/how-to/raspberry-pi-os#prerequisites))
* Or any other server with SSH access

:::warning Note:
Itâ€™s best to use a fresh server for Coolify to avoid any conflicts with existing applications.
:::

:::info Tip:
If you haven't picked a server provider yet, consider using [Hetzner](https://coolify.io/hetzner). You can even use our [referral link](https://coolify.io/hetzner) to support the project.
:::

### 2. Supported Operating Systems

Coolify supports several Linux distributions:

* Debian-based (e.g., Debian, Ubuntu - all versions supported, but non-LTS Ubuntu requires manual installation)
* Redhat-based (e.g., CentOS, Fedora, Redhat, AlmaLinux, Rocky, Asahi)
* SUSE-based (e.g., SLES, SUSE, openSUSE)
* Arch Linux (Note: Not all Arch derivatives are supported)
* Alpine Linux
* Raspberry Pi OS 64-bit (Raspbian)

::: info Note
For some distros (like AlmaLinux), Docker must be pre-installed. If the install script fails, manually install Docker and re-run the script.

Other Linux distributions may work with Coolify, but have not been officially tested.
:::

### 3. Supported Architectures

Coolify runs on 64-bit systems:

* AMD64
* ARM64

::: warning âš ï¸ Note for Raspberry Pi users:
Be sure to use the 64-bit version of Raspberry Pi OS (Raspbian). For details, check our [Raspberry Pi OS Setup Guide](/knowledge-base/how-to/raspberry-pi-os#prerequisites).
:::

### 4. Minimum Hardware Requirements

Your server should have at least:

* **CPU**: 2 cores
* **Memory (RAM)**: 2 GB
* **Storage**: 30 GB of free space

Coolify may function properly on servers with lower specs than those mentioned above, but we recommend slightly higher minimum requirements.

This ensures that users have sufficient resources to deploy multiple applications without performance issues.

::: warning Heads up!
If youâ€™re running both builds and Coolify on the same server, monitor your resource usage. High resource usage could make your server unresponsive.

Consider enabling swap space or upgrading your server if needed.
:::

### 5. Server Resources for Your Projects

The resources you need depend on your projects. For example, if you're hosting multiple services or larger applications, choose a server with higher CPU, memory, and storage.

::: success âš™ï¸ Example Setup:
Andras runs his production apps on a server with:

* **Memory**: 8GB (average usage: 3.5GB)
* **CPU**: 4 cores (average usage: 20â€“30%)
* **Storage**: 150GB (average usage: 40GB)

This setup comfortably supports:

* 3 NodeJS apps
* 4 Static sites
* Plausible Analytics
* Fider (feedback tool)
* UptimeKuma (uptime monitoring)
* Ghost (newsletters)
* 3 Redis databases
* 2 PostgreSQL databases
  :::

## Installation Methods

There are two ways to install Coolify:

* [Quick Installation](#quick-installation-recommended) (Recommended)
* [Manual Installation](#manual-installation)

We highly recommend the **Quick Installation** method as it automates the process and reduces the chance of errors.

***

### Quick Installation (Recommended)

This is the simplest and fastest way to get Coolify up and running.

#### 1. Prepare Your Server

* Log in as the root user (non-root users are not fully supported yet).
* Configure SSH by following the [SSH Settings Guide](/knowledge-base/server/openssh#ssh-settings-configuration).
* Set up your firewall with the help of the [Firewall Guide](/knowledge-base/server/firewall).
* Ensure that [curl](https://curl.se/) is installed (it usually comes pre-installed).

#### 2. Run the Installation Script

Once your server is ready, run:

```sh
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

View the [Script's Source Code](https://github.com/coollabsio/coolify/blob/main/scripts/install.sh)

::: info Tip:
If you're not logged in as the root user, run the script with sudo:

```sh
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
```

:::

#### Advanced: Customizing Installation with Environment Variables

The installation script supports several environment variables to customize your Coolify installation. These are completely optional.

:::details Click to view all available environment variables

You can set these environment variables before running the installation script to customize your Coolify setup:

| Environment Variable         | Description                                           | Default Value | Example              |
| ---------------------------- | ----------------------------------------------------- | ------------- | -------------------- |
| `ROOT_USERNAME`              | Predefined root username for first admin account      | -             | `admin`              |
| `ROOT_USER_EMAIL`            | Predefined root user email for first admin account    | -             | `admin@example.com`  |
| `ROOT_USER_PASSWORD`         | Predefined root user password for first admin account | -             | `SecurePassword123!` |
| `DOCKER_ADDRESS_POOL_BASE`   | Custom Docker address pool base (CIDR notation)       | `10.0.0.0/8`  | `172.16.0.0/12`      |
| `DOCKER_ADDRESS_POOL_SIZE`   | Custom Docker address pool size (must be 16-28)       | `24`          | `20`                 |
| `DOCKER_POOL_FORCE_OVERRIDE` | Force override existing Docker pool configuration     | `false`       | `true`               |
| `AUTOUPDATE`                 | Enable/disable automatic Coolify updates              | `true`        | `false`              |
| `REGISTRY_URL`               | Custom Docker registry URL for Coolify images         | `ghcr.io`     | `your-registry.com`  |

**Usage Examples:**

**1. Create Admin Account During Installation:**

```bash
env ROOT_USERNAME=admin \
ROOT_USER_EMAIL=admin@example.com \
ROOT_USER_PASSWORD=SecurePassword123 \
bash -c 'curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash'
```

See the [Create Root User with Environment Variables](/knowledge-base/create-root-user-with-env) guide for more details.

**2. Custom Docker Network Pool:**

```bash
env DOCKER_ADDRESS_POOL_BASE=172.16.0.0/12 \
DOCKER_ADDRESS_POOL_SIZE=20 \
bash -c 'curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash'
```

See the [Define Custom Docker Network with ENV](/knowledge-base/define-custom-docker-network-with-env) guide for more details.

**3. Disable Auto-Updates:**

```bash
env AUTOUPDATE=false \
bash -c 'curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash'
```

**4. Use Custom Docker Registry:**

```bash
env REGISTRY_URL=your-registry.com \
bash -c 'curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash'
```

When using a custom registry, make sure all required Coolify images are available in your registry.

**5. Combine Multiple Variables:**

```bash
env ROOT_USERNAME=admin \
ROOT_USER_EMAIL=admin@example.com \
ROOT_USER_PASSWORD=SecurePassword123 \
AUTOUPDATE=false \
DOCKER_ADDRESS_POOL_BASE=172.16.0.0/12 \
bash -c 'curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash'
```

:::

#### 3. Access Coolify

After installation, the script will display your Coolify URL (e.g., `http://203.0.113.1:8000`). Visit this URL, and you'll be redirected to a registration page to create your first admin account.

::: danger âš ï¸ CAUTION:
**Immediately create your admin account after installation. If someone else accesses the registration page before you, they might gain full control of your server.**
:::

::: info Note:
If you installed Coolify on a Raspberry Pi within your home network, use your private IP address to access it, as the public IP may not work.
:::

#### What the Installer Does:

* Installs essential tools (curl, wget, git, jq, openssl)
* Installs Docker Engine (version 24+)
* Configures Docker settings (logging, daemon)
* Sets up directories at `/data/coolify`
* Configures SSH keys for server management
* Installs and starts Coolify

::: warning âš ï¸ Caution:
Docker installed via snap is not supported!
:::

**The quick installation guide ends here. If youâ€™ve followed the steps above, you can start using Coolify now. The guide below is for those who want to manually install and set up Coolify.**

***

### Manual Installation

For those who prefer more control, you can install Coolify manually. This method requires a few extra steps.

::: info Note
This manual installation method is required for:

* Non-LTS Ubuntu versions (e.g., 24.10)
* Systems where the automatic script encounters issues
  :::

#### Prerequisites

* **SSH**: Ensure SSH is enabled and set up correctly (see [SSH Configuration Guide](/knowledge-base/server/openssh)).
* **curl**: Confirm that [curl](https://curl.se/) is installed.
* **Docker Engine**: Install Docker by following the official [Docker Engine Installation guide](https://docs.docker.com/engine/install/#server) (version 24+).

::: warning âš ï¸ Caution:
Docker installed via snap is not supported!
:::

***

Follow these steps for a manual setup:

#### 1. Create Directories

Create the base directories for Coolify under `/data/coolify`:

```sh
mkdir -p /data/coolify/{source,ssh,applications,databases,backups,services,proxy,webhooks-during-maintenance}
mkdir -p /data/coolify/ssh/{keys,mux}
mkdir -p /data/coolify/proxy/dynamic
```

#### 2. Generate & Add SSH Key

Generate an SSH key for Coolify to manage your server:

```sh
ssh-keygen -f /data/coolify/ssh/keys/id.root@host.docker.internal -t ed25519 -N '' -C root@coolify
```

Then, add the public key to your `~/.ssh/authorized_keys`:

```sh
cat /data/coolify/ssh/keys/id.root@host.docker.internal.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

::: info Tip!
If you already have an SSH key, you can skip generating a new one, but remember to add it to your Coolify instance after installation.
:::

#### 3. Setup Configuration Files

Download the necessary files from Coolifyâ€™s CDN to `/data/coolify/source`:

```sh
curl -fsSL https://cdn.coollabs.io/coolify/docker-compose.yml -o /data/coolify/source/docker-compose.yml
curl -fsSL https://cdn.coollabs.io/coolify/docker-compose.prod.yml -o /data/coolify/source/docker-compose.prod.yml
curl -fsSL https://cdn.coollabs.io/coolify/.env.production -o /data/coolify/source/.env
curl -fsSL https://cdn.coollabs.io/coolify/upgrade.sh -o /data/coolify/source/upgrade.sh
```

#### 4. Set Permissions

Set the correct permissions for the Coolify files and directories:

```sh
chown -R 9999:root /data/coolify
chmod -R 700 /data/coolify
```

#### 5. Generate Values

Update the `.env` file with secure random values:

```sh
sed -i "s|APP_ID=.*|APP_ID=$(openssl rand -hex 16)|g" /data/coolify/source/.env
sed -i "s|APP_KEY=.*|APP_KEY=base64:$(openssl rand -base64 32)|g" /data/coolify/source/.env
sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=$(openssl rand -base64 32)|g" /data/coolify/source/.env
sed -i "s|REDIS_PASSWORD=.*|REDIS_PASSWORD=$(openssl rand -base64 32)|g" /data/coolify/source/.env
sed -i "s|PUSHER_APP_ID=.*|PUSHER_APP_ID=$(openssl rand -hex 32)|g" /data/coolify/source/.env
sed -i "s|PUSHER_APP_KEY=.*|PUSHER_APP_KEY=$(openssl rand -hex 32)|g" /data/coolify/source/.env
sed -i "s|PUSHER_APP_SECRET=.*|PUSHER_APP_SECRET=$(openssl rand -hex 32)|g" /data/coolify/source/.env
```

::: warning âš ï¸ Important:
Run these commands only the first time you install Coolify. Changing these values later can break your installation. Keep them safe!
:::

#### 6. Create Docker Network

Ensure the Docker network is created:

```sh
docker network create --attachable coolify
```

#### 7. Start Coolify

Launch Coolify using Docker Compose:

```sh
docker compose --env-file /data/coolify/source/.env -f /data/coolify/source/docker-compose.yml -f /data/coolify/source/docker-compose.prod.yml up -d --pull always --remove-orphans --force-recreate
```

::: warning âš ï¸ Important:
You might have to do `docker login` at this point if you have any issues above.
:::

#### 8. Access Coolify

You can now access Coolify by visiting `http://203.0.113.1:8000` (replace the `203.0.113.1` with the IP address of your server).

If you get stuck at any step, feel free to join our [Discord community](https://coolify.io/discord) and create a post in the support forum channel.

---

---
url: /docs/applications/ci-cd/bitbucket/integration.md
description: >-
  Deploy Bitbucket repositories with Coolify using deploy keys, SSH
  authentication, and automated webhooks for commits and pull requests.
---

# Bitbucket Integration

This guide will show you how to use Bitbucket based repositories with Coolify.

## Public Repositories

You can use public repositories without any additional setup.

1. Select the `Public repository` option in the Coolify when you create a new resource.
2. Add your repository URL to the input field, for example: `https://bitbucket.com/coolify-test2/coolify-examples`

::: warning Caution
You can only use the https URL.
:::

1. That's it! Coolify will automatically pull the latest version of your repository and deploy it.

## Private Repositories

Private repositories require a few more steps to setup.

1. Add a private key (aka `Deploy Keys`) to Coolify and to your Bitbucket repository in the `Repository Settings` / `Access Keys` menu.

::: warning Caution

* You can generate a new key pair with the following command:

```bash
ssh-keygen -t rsa -b 4096 -C "deploy_key" 
```

* Or you can also use Coolify to generate a new key for you in the `Keys & Tokens` menu.
  :::

2. Create a new resource and select the `Private Repository (with deploy key)`
3. Add your repository URL to the input field, for example: `git@bitbucket.org:coolify-test2/coolify-examples.git`

::: warning Caution
You need to use the SSH URL, so the one that starts with `git@`.
:::

4. That's it! Coolify will automatically pull the latest version of your repository and deploy it.

## Automatic commit deployments with webhooks (Optional)

You can add a custom webhook URL to your Bitbucket repository to trigger a new deployment when you push to your repository.

::: warning Caution
This can be set on either public or private repositories.
:::

In your resource, there is a `Webhooks` menu. In the `Manual Git Webhooks` section, you can find the URL what you need to set in your Bitbucket repository.

1. Set a secret key in the `Bitbucket Webhook Secret` input field.
2. Go to your repository in Bitbucket and open the `Repository Settings` / `Webhooks` menu as `Repository hooks`.
3. Add the URL from Coolify to the `URL` input field and the secret token.
4. Select the `Push` option.
5. That's it! Now when you push to your repository, Bitbucket will send a webhook request to Coolify and it will trigger a new deployment.

## Merge request deployments with webhooks (Optional)

You can add a custom webhook URL to your Bitbucket repository to trigger a new deployment when you create a new merge request.

::: warning Caution
This can be set on either public or private repositories.
:::

The process is the same as the previous one. In the `Repository Settings` / `Webhooks` menu, you need to select the following events in the `Pull Request` option:

* `Created`
* `Updated`
* `Merged`
* `Declined`

---

---
url: /docs/applications/ci-cd/gitea/integration.md
description: >-
  Deploy Gitea repositories with Coolify using deploy keys, SSH authentication,
  and automated webhooks for commits and pull requests.
---

# Gitea Integration

This guide will show you how to use Gitea based repositories with Coolify.

## Public Repositories

You can use public repositories without any additional setup.

1. Select the `Public repository` option in the Coolify when you create a new resource.
2. Add your repository URL to the input field, for example: `https://gitea.com/heyandras/coolify-examples`

::: warning Caution
You can only use the https URL.
:::

1. That's it! Coolify will automatically pull the latest version of your repository and deploy it.

## Private Repositories

Private repositories require a few more steps to setup.

1. Add a private key (aka `Deploy Keys`) to Coolify and to your Gitea repository in the `Repository Settings` / `Access Keys` menu.

::: warning Caution

* You can generate a new key pair with the following command:

```bash
ssh-keygen -t rsa -b 4096 -C "deploy_key" 
```

* Or you can also use Coolify to generate a new key for you in the `Keys & Tokens` menu.
  :::

2. Create a new resource and select the `Private Repository (with deploy key)`
3. Add your repository URL to the input field, for example: `git@gitea.com:heyandras/coolify-examples.git`

::: warning Caution
You need to use the SSH URL, so the one that starts with `git@`.
:::

4. That's it! Coolify will automatically pull the latest version of your repository and deploy it.

## Automatic commit deployments with webhooks (Optional)

You can add a custom webhook URL to your Gitea repository to trigger a new deployment when you push to your repository.

::: warning Caution
This can be set on either public or private repositories.
:::

In your resource, there is a `Webhooks` menu. In the `Manual Git Webhooks` section, you can find the URL what you need to set in your Gitea repository.

1. Set a secret key in the `Gitea Webhook Secret` input field.
2. Go to your repository in Gitea and open the `Repository Settings` / `Webhooks` menu as `Repository hooks`.
3. Add the URL from Coolify to the `URL` input field and the secret token.
4. Select the `Push` option.
5. That's it! Now when you push to your repository, Gitea will send a webhook request to Coolify and it will trigger a new deployment.

## Merge request deployments with webhooks (Optional)

You can add a custom webhook URL to your Gitea repository to trigger a new deployment when you create a new merge request.

::: warning Caution
This can be set on either public or private repositories.
:::

The process is the same as the previous one. In the `Repository Settings` / `Webhooks` menu, you need to select the following events in the `Pull Request` option:

* `Created`
* `Updated`
* `Merged`
* `Declined`

---

---
url: /docs/applications/ci-cd/github/integration.md
description: >-
  Deploy public and private GitHub repositories with Coolify using GitHub App
  integration, deploy keys, or automated webhooks for commits and pull requests.
---

# Github Integration

This guide will show you how to use GitHub based repositories with Coolify.

## Public Repositories

You can use public repositories without any additional setup.

1. Select the `Public repository` option in the Coolify when you create a new resource.
2. Add your repository URL to the input field, for example: `https://github.com/coollabsio/coolify-examples`

::: warning Caution
You can only use the https URL.
:::

3. That's it! Coolify will automatically pull the latest version of your repository and deploy it.

## Private Repositories

### With GitHub App (Recommended)

You can use private repositories with the GitHub App integration. You will get full integration with GitHub, like automatic commit deployments and pull request deployments.

1. Create a new GitHub App in the `Sources` view.
2. Create a new resource and select the `Private Repository (with GitHub App)`.
3. Choose your repository from the list.
4. That's it!

:::warning Note for Coolify Cloud Users
You can make the GitHub App available to all teams on your Coolify instance by enabling the `System Wide` option.

However, this feature is only available for self-hosted instances, as Coolify Cloud users cannot use the `System Wide` option due to how Coolify Cloud is set up.
:::

### With Deploy Keys

1. Add a private key (aka `Deploy Keys`) to Coolify and to your GitHub repository in the `Settings` / `Deploy Keys` menu.

::: warning Caution

* You can generate a new key pair with the following command:

```bash
ssh-keygen -t rsa -b 4096 -C "deploy_key" 
```

* Or you can also use Coolify to generate a new key for you in the `Keys & Tokens` menu.
  :::

2. Create a new resource and select the `Private Repository (with deploy key)`
3. Add your repository URL to the input field, for example: `git@github.com:coollabsio/coolify-examples.git`

::: warning Caution
You need to use the SSH URL, so the one that starts with `git@`.
:::

4. That's it!

## Automatic commit deployments with webhooks (Optional)

You can add a custom webhook URL to your GitHub repository to trigger a new deployment when you push to your repository.

::: warning Caution
This can be set on either public or private repositories.

Not required if you use GitHub App integration.
:::

In your resource, there is a `Webhooks` menu. In the `Manual Git Webhooks` section, you can find the URL what you need to set in your GitHub repository.


1. Set a secret key in the `GitHub Webhook Secret` input field.

2. Go to your repository on GitHub and open the `Settings` / `Webhooks` menu.

3. Add the URL from Coolify to the `URL` input field and the secret token.

4. Select the `Push events` option.

5. That's it! Now when you push to your repository, GitHub will send a webhook request to Coolify and it will trigger a new deployment.

## Pull request deployments with webhooks (Optional)

You can add a custom webhook URL to your GitHub repository to trigger a new deployment when you create a new merge request.

::: warning Caution
This can be set on either public or private repositories.

Not required if you use GitHub App integration.
:::

The process is the same as the previous one, but you need to select the `Pull Request` events option in the `Settings` / `Webhooks` menu.

---

---
url: /docs/applications/ci-cd/gitlab/integration.md
description: >-
  Connect GitLab repositories to Coolify with deploy keys, Gitlab container
  registry with deploy token, automatic webhooks, and merge request deployments
  for CI/CD automation
---

# GitLab Integration

## Public Repositories

You can use public repositories without any additional setup.

1. Select the `Public repository` option in the Coolify when you create a new resource.

2. Add your repository URL to the input field, for example: `https://gitlab.com/andrasbacsai/coolify-examples`

   ::: warning Caution
   You can only use the https URL.
   :::

3. That's it! Coolify will automatically pull the latest version of your repository and deploy it.

## Private Repositories

Private repositories require a few more steps to setup.

1. Add a private key (aka `Deploy Keys`) to Coolify and to your GitLab repository in the `Settings` / `Repository` / `Deploy Keys` menu.

::: warning Caution

* You can generate a new key pair with the following command:

```bash
ssh-keygen -t rsa -b 4096 -C "deploy_key"
```

* Or you can also use Coolify to generate a new key for you in the `Keys & Tokens` menu.
  :::

2. Create a new resource and select the `Private Repository (with deploy key)`
3. Add your repository URL to the input field, for example: `git@gitlab.com:andrasbacsai/coolify-examples.git`

::: warning Caution
You need to use the SSH URL, so the one that starts with `git@`.
:::

4. That's it! Coolify will automatically pull the latest version of your repository and deploy it.

## Public Container Registry

You can use public container registry without any additional setup.

1. Select the `Docker Image` option in the Coolify when you create a new resource.
2. Add your public container registry URL and also the tag to the input field, for example: `registry.gitlab.com/username/repository:latest`.
3. Press the `Deploy` button.
4. That's it! Coolify will automatically pull the latest version of your container registry and deploy it.

## Private Container Registry

Private container registry require a few more steps to setup.

1. Add a `Deploy Token` in your GitLab repository in the `Settings` / `Repository` / `Deploy Token` with scope `read_registry`. This step will generate credentials `username` and `token`
2. login docker with that credentials in your coolify server

```
echo "token-xxx" | docker login registry.privategitlab.com -u gitlab+deploy-token-xxx --password-stdin
```

3. Select the `Docker Image` option in the Coolify when you create a new resource.
4. Add your private container registry URL and also the tag to the input field, for example: `registry.privategitlab.com/username/repository:latest`.
5. Press the `Deploy` button.
6. That's it! Coolify will automatically pull the latest version of your container registry and deploy it.

## Automatic commit deployments with webhooks (Optional)

You can add a custom webhook URL to your GitLab repository to trigger a new deployment when you push to your repository.

::: warning Caution
This can be set on either public or private repositories.
:::

In your resource, there is a `Webhooks` menu. In the `Manual Git Webhooks` section, you can find the URL what you need to set in your GitLab repository.

1. Set a secret key in the `GitLab Webhook Secret` input field.
2. Go to your repository in GitLab and open the `Settings` / `Webhooks` menu.
3. Add the URL from Coolify to the `URL` input field and the secret token.
4. Select the `Push events` option.
5. That's it! Now when you push to your repository, GitLab will send a webhook request to Coolify and it will trigger a new deployment.

## Merge request deployments with webhooks (Optional)

You can add a custom webhook URL to your GitLab repository to trigger a new deployment when you create a new merge request.

::: warning Caution
This can be set on either public or private repositories.
:::

The process is the same as the previous one, but you need to select the `Merge request events` option in the `Settings` / `Webhooks` menu.

---

---
url: /docs/databases.md
description: >-
  Deploy databases on Coolify with one-click setup for PostgreSQL, MySQL,
  MariaDB, MongoDB, Redis, KeyDB, DragonFly, and ClickHouse.
---

# Databases you can host with Coolify

Coolify supports a variety of databases to suit different application needs. Even if you don't see your favorite database here, you can still host it with Coolify, using Docker.

Coolify offers one-click setup for the following databases:

* [PostgreSQL](/databases/postgresql)
* [Redis](/databases/redis)
* [DragonFly](/databases/dragonfly)
* [KeyDB](/databases/keydb)
* [Clickhouse](/databases/clickhouse)
* [MongoDB](/databases/mongodb)
* [MySQL](/databases/mysql)
* [MariaDB](/databases/mariadb)

Each database has its own strengths and use cases. Click on a database to learn more about it.

# Deploy a database

When selecting a New Resource, you can select a database from the list.

![New Resource](/images/screenshots/How-to-add-a-database.webp)

You can configure a database with a simple click. Coolify supports the following databases:

* PostgreSQL
* MySQL
* MariaDB
* MongoDB
* Redis
* DragonFly
* KeyDB
* Clickhouse

## Ports Mapping vs Public Port

### Ports Mapping

Ports mapping is using the Docker [port mapping](https:/.docker.com/network/#published-ports) feature. It is used to map the container port to the host port. For example, if you set the port mapping to `8080:80`, the container port `80` will be mapped to the host port `8080`.

### Public Port

Public port is used to expose the container port to the internet, by starting an Nginx TCP proxy.

### Which one should I use?

* Port mappings makes the connection/port permanent (you need to restart your database to change it).
* The public port makes the connection/port dynamic (you can change it without restarting the database, Coolify will restart the Nginx TCP proxy for you).

## Access database during builds

If you are using `Nixpacks` build pack, you have two ways to access your database during builds:

1. Database & your application are `in the same network`: You can reach it using the `internal URL` provided by Coolify.
2. Database & your application `are not in the same network`: You need to set your database to be `Accessible over the internet` and use the `public URL` provided by Coolify.

---

---
url: /docs/knowledge-base/s3/introduction.md
description: >-
  Configure S3-compatible storage for Coolify backups including AWS,
  DigitalOcean Spaces, MinIO, Cloudflare R2, Backblaze B2, and Scaleway Object
  Storage.
---

# S3 Introduction

Currently supported S3 compatible storages are:

* AWS (see [the AWS guide](/knowledge-base/s3/aws) for a detailed walkthrough)
* DigitalOcean Spaces
* MinIO
* Cloudflare's R2
* Backblaze B2
* Scaleway Object Storage
* Hetzner S3 Storage (beta)
* Wasabi hot cloud storage
* Vultr
* CloudPe Object Storage

Other's could work, but not tested yet. If you test it, please let us know.

## S3 Client

Coolify uses MinIO's client, called [`mc`](https://min.io/docs/minio/linux/reference/minio-mc.html), to copy the backup files to your S3 compatible storage.

## Verification

To be able to use your S3 compatible storage, you need to verify it first. Verification done with `ListObjectsV2` request to your specified bucket.

So you need to create a bucket first, and then you can verify it.

---

---
url: /docs/knowledge-base/server/introduction.md
description: >-
  Connect localhost and remote Linux servers to Coolify with SSH authentication,
  Docker Engine, wildcard domains, and Traefik proxy setup.
---

# Introduction

No matter what type of server you have (localhost or remote), you need the following requirements.

* Connectivity
  * SSH connectivity between Coolify and the server with SSH key authentication.
    ::: success Tip
    Your public key should be added to **root** user's `~/.ssh/authorized_keys`.
    If you do not have an SSH Key, you can generate one through Coolify with a simple button or you can generate one manually.
    :::
* Docker Engine (24+)

## Types

* **Localhost**: the server where Coolify is installed.
* **Remote Server**: could be any remote linux server.

## Localhost

To be able to manage the server where Coolify is running on, the docker container of Coolify should reach the host server through SSH.
You can use localhost as a server where all your resources are running, but it is not recommended as high server usage could prevent to use Coolify.
::: success Tip
You can use our [Cloud](https://app.coolify.io) version, so you only need a server for your resources.

You will get a few other things included with the cloud version, like free email notifications, s3 storage, etc based on your subscription plan.
:::

## Remote Server

You can connect any type of servers to Coolify. It could be a VPS, a Raspberry PI or a laptop running Linux.
::: success Tip
If you don't have a server or server provider yet, we prefer to use Hetzner.
You can use our [referral link](https://coolify.io/hetzner). It will help us to keep the project alive.
:::

### Cloudflare Tunnels

You can also set to use Cloudflare Tunnels for your servers.
::: success Tip
Coolify does not install cloudflared on your server, it needs to be done prior.
All it does is to add the right ProxyCommand (`ProxyCommand <ip / hostname> access ssh --hostname %h`) to all ssh connections.
:::

## Multiple Server Configuration

When setting up multiple servers in Coolify, it's important to understand how traffic routing works:

* **Independent Proxy Handling**: Each server runs its own proxy that handles incoming requests for applications deployed on that server.
* **Direct Traffic Flow**: Traffic for applications deployed on secondary servers goes directly to those servers, not through the main Coolify server.
* **DNS Configuration**: You must point your domain DNS to the IP address of the server where the application is deployed, not to the main Coolify server.

### Role of the Main Server

The main Coolify server:

* Provides the management UI to control applications on all connected servers
* Performs SSH connections to secondary servers for deployment and management
* Conducts health checks and monitoring
* Does NOT route or proxy traffic to applications on secondary servers

This architecture reduces latency and improves application performance by eliminating additional network hops.

## Features

### Disk Cleanup threshold

You can read more about Automated Cleanup and the disk cleanup threshold in the [Automated Cleanup](/knowledge-base/server/automated-cleanup) section.

### Wildcard Domain

You can set a wildcard domain (`example: http://example.com`) to your server, so you can easily assign generated domains to all the resources connected to this server.
Example: Your application UUID is `vgsco4o`.
If you have the example set, you will get the following FQDN: `http://vgsco4o.example.com`
If you do not have any wildcard domain set, Coolify will generate a [sslip.io](https://sslip.io) domain, which is free & magical domain that you can use anywhere.
In this case, it will be: `http://vgsco4o.127.0.0.1.sslip.io`, where `127.0.0.1` is your server's IP.

::: success Tip
When using multiple servers, remember that each application's domain must point to the specific server where that application is deployed.
:::

## Proxy

* **Traefik**: Automatically configure Traefik(v2) based on your deployed resources.
* **Custom/None**: You will configure a proxy manually (only for advanced users).
  ::: success Tip
  Soon we will support Nginx & Caddy with fully automated configuration.
  :::

### Traefik

Coolify uses Traefik proxy by default to create a reverse proxy for your resources.
::: success Tip
Traefik only starts when you did not select any proxy for your server and you
have a domain configured for a resource or your Coolify instance itself.
:::

#### Dynamic Configuration

You can always add your own configuration to the proxy settings from Coolify's UI (`/server/<server_uuid>/proxy`).

---

---
url: /docs/get-started/introduction.md
description: >-
  Coolify is an open-source self-hosted PaaS alternative to Vercel, Heroku, and
  Railway with unlimited deployments, no vendor lock-in, and free SSL.
---

## What is Coolify?

Coolify is a software that makes self-hosting simple and powerful. It lets you run your applications, databases, and services on your own server, whether thatâ€™s an old laptop, a Raspberry Pi, or a rented server from a provider like [Hetzner](https://coolify.io/hetzner).

With Coolify, you get full control over your projects, your data, and your costs. Itâ€™s completely free to use, open-source, and has no features locked behind a paywall.

Think of Coolify as your personal alternative to cloud platforms like [Vercel](https://vercel.com?utm_source=coolify.io), [Railway](https://railway.com/?utm_source=coolify.io), or [Heroku](https://www.heroku.com/?utm_source=coolify.io), but without the huge bills or privacy trade-offs.

### What Coolify Is Not

Coolify isnâ€™t a cloud service that hosts everything for you, you need your own server. That could be your old laptop, a Raspberry Pi, or a rented server from a hosting provider like [Hetzner](https://coolify.io/hetzner), and youâ€™ll need SSH access to use it.

Itâ€™s not a zero-effort solution either, if you choose to self-host, youâ€™ll need to set up your server and install Coolify. But once itâ€™s running, managing your projects becomes very easy.

## Features of Coolify

Coolify is loaded with tools to make self-hosting smooth and powerful. Hereâ€™s a detailed look at what it offers:

| Features                  | Explanation                                                                                               |
| :------------------------ | :-------------------------------------------------------------------------------------------------------- |
| **Any Language**          | Deploy static sites, APIs, backends, databases, and more with support for all major frameworks.           |
| **Any Server**            | Deploy to any server - VPS, Raspberry Pi, EC2, your laptop via SSH.                                       |
| **Any Use-Case**          | Supports single servers, multi-server setups, and Docker Swarm clusters (Kubernetes support coming soon). |
| **Any Service**           | Deploy any Docker-compatible service, plus a wide range of one-click options.                             |
| **Push to Deploy**        | Git integration with GitHub, GitLab, Bitbucket, Gitea, and other platforms.                               |
| **Free SSL Certificates** | Automatically sets up and renews Let's Encrypt SSL certificates for custom domains.                       |
| **No Vendor Lock-In**     | Your data and settings stay on your servers for full control and easy portability.                        |
| **Automatic Backups**     | Back up data to S3-compatible storage and restore it with one click if needed.                            |
| **Webhooks**              | Integrate with CI/CD tools like GitHub Actions, GitLab CI, or Bitbucket Pipelines.                        |
| **Powerful API**          | Automate deployments, manage resources, and integrate with your existing tools easily.                    |
| **Real-Time Terminal**    | Run server commands directly from your browser in real-time.                                              |
| **Collaborative**         | Share projects with your team, control roles, and manage permissions.                                     |
| **PR Deployments**        | Deploy commits and pull requests separately for quick reviews and faster teamwork.                        |
| **Server Automations**    | Handles server setup tasks automatically after connection, saving you time.                               |
| **Monitoring**            | Monitor deployments, servers, disk usage, and receive alerts for issues.                                  |

## Benefits of Using Coolify

Coolify delivers unbeatable advantages for developers who want to self-host. Hereâ€™s why it stands out:

| Benefits                    | Explanation                                                                                                                                                                                                                                                                                         |
| :-------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cost Savings**            | Avoid skyrocketing cloud costs. Use your own server for a steady, predictable price.                                                                                                                                                                                                                |
| **No Hidden Costs**         | Transparent pricing with no unexpected charges.                                                                                                                                                                                                                                                     |
| **Highly Cost-Efficient**   | Save thousands monthly compared to traditional cloud platforms. Real examples can be found [here](https://twitter.com/heyandras/status/1742078215986860460), [here](https://twitter.com/heyandras/status/1752209429276086688), and [here](https://twitter.com/heyandras/status/1724510876256944244) |
| **Complete Data Privacy**   | Your data stays on your server, ensuring total control and security.                                                                                                                                                                                                                                |
| **No Feature Restrictions** | All features are included in the open-source versionâ€”nothing locked behind a paywall.                                                                                                                                                                                                               |
| **Unlimited Usage**         | Deploy unlimited websites and applications across any number of servers.                                                                                                                                                                                                                            |
| **Quick Setup**             | Start hosting in minutes with minimal maintenance required.                                                                                                                                                                                                                                         |
| **User-Friendly Interface** | Manage your infrastructure through a clean, simple dashboard designed for developers.                                                                                                                                                                                                               |
| **100% Open Source**        | Review the code, contribute to development, and help shape the platformâ€™s future.                                                                                                                                                                                                                   |
| **Active Community**        | Join over 16,000 people on Discord and 204,000+ servers running Coolify worldwide.                                                                                                                                                                                                                  |

## Getting Started with Coolify

Before you jump into using Coolify, itâ€™s worth understanding a few key concepts to make your journey smoother.

Learn about servers, SSH access, and how Coolify manages your projects by checking out our [concepts guide](/get-started/concepts).

You have two ways to use Coolify:

* [Self-Host Coolify](#self-host-coolify)
* [Use Coolify Cloud](#use-coolify-cloud)

***

### Self-Host Coolify

* Install Coolify on your own server. This requires setting up the server, installing Coolify, and handling updates yourself.
* Youâ€™ll also need to allocate some server resources to run Coolify.
* Itâ€™s completely free (except your server bills) and gives you full control over your infrastructure.

### Use Coolify Cloud

* Let the Coolify team manage Coolify for you.
* With Coolify Cloud, you donâ€™t need to install or update Coolify yourself, and no server resources are required for Coolify itself, it runs on the Coolify teamâ€™s managed servers.
* Simply create an account from [here](https://app.coolify.io/register), connect your servers via SSH keys, and start deploying.
  This is a paid service (starting at $5/mo), as it costs the team to host and maintain the infrastructure.
* Updates on Coolify Cloud are thoroughly tested by the core team, so they might be slightly delayed for added stability.

## Join Our Community

Got questions or need support? Our [discord community](https://coollabs.io/discord) is here to help.
Connect with other Coolify users on our community server to get assistance and share your experiences.

---

---
url: /docs/services/invoice-ninja.md
description: >-
  Run Invoice Ninja on Coolify for invoicing, expense tracking, time billing,
  payment processing, and client management for freelancers.
---

# Invoice Ninja

A self-hosted invoicing platform for small businesses.

## Screenshots

![Invoice Ninja Preview](https://invoiceninja.com/wp-content/uploads/2024/01/product-overview-thumbnail.png)

## Links

* [The official website](https://www.invoiceninja.com/)

---

---
url: /docs/services/it-tools.md
description: >-
  Host IT Tools collection on Coolify with 80+ developer utilities for encoding,
  hashing, formatting, and text transformation in web interface.
---

# It Tools

## What is It Tools

IT Tools is a self-hosted solution for managing various IT tasks.

## Links

* [Official Documentation](https://github.com/corentinth/it-tools?utm_source=coolify.io)

---

---
url: /docs/applications/jekyll.md
description: >-
  Deploy Jekyll static sites on Coolify using Nixpacks or Dockerfile with Ruby,
  Nginx, and automated build processes.
---

# Jekyll

Jekyll is a simple, blog-aware, static site generator for personal, project, or organization sites.

## Deploy with Nixpacks

Nixpacks needs a few prerequisites in your source code to deploy your Jekyll application. More info [here](https://nixpacks.com/docs/providers/ruby).

## Deploy with Dockerfile

If you want simplicity, you can use a Dockerfile to deploy your Jekyll application.

### Prerequisites

1. Set `Ports Exposes` field to `80`.
2. Create a `Dockerfile` in the root of your project with the following content:

```Dockerfile
FROM ruby:3.1.1 AS builder
RUN apt-get update -qq && apt-get install -y build-essential nodejs
WORKDIR /srv/jekyll
COPY Gemfile Gemfile.lock ./
RUN bundle install
COPY . .
RUN chown 1000:1000 -R /srv/jekyll
RUN bundle exec jekyll build -d /srv/jekyll/_site

FROM nginx:alpine
COPY --from=builder /srv/jekyll/_site /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

3. Make sure you have a `Gemfile` and `Gemfile.lock` in the root of your project.
4. Set the buildpack to `Dockerfile`.

---

---
url: /docs/services/jellyfin.md
description: >-
  Deploy Jellyfin media server on Coolify for streaming movies, TV shows, music
  with no licensing, transcoding, and mobile app support.
---

![Jellyfin](https://raw.githubusercontent.com/jellyfin/jellyfin-ux/master/branding/SVG/banner-logo-solid.svg?sanitize=true)

## What is Jellyfin?

Jellyfin is a Free Software Media System that puts you in control of managing and streaming your media. It is an alternative to the proprietary Emby and Plex, to provide media from a dedicated server to end-user devices via multiple apps. Jellyfin is descended from Emby's 3.5.2 release and ported to the .NET Core framework to enable full cross-platform support.

There are no strings attached, no premium licenses or features, and no hidden agendas: just a team who want to build something better and work together to achieve it. We welcome anyone who is interested in joining us in our quest!

## Links

* [The official website](https://jellyfin.org/)
* [GitHub](https://github.com/jellyfin/jellyfin)

---

---
url: /docs/services/jenkins.md
description: >-
  Run Jenkins CI/CD on Coolify for automated builds, testing, deployment
  pipelines, and continuous integration workflows with extensive plugins.
---

![Jenkins](https://www.jenkins.io/images/jenkins-logo-title-dark.svg)

## What is Jenkins?

Jenkins is a popular open-source automation server used for continuous integration and continuous delivery (CI/CD). It allows developers to build, test, and deploy software projects reliably.

## Links

* [The official website](https://www.jenkins.io/)
* [GitHub](https://github.com/jenkinsci/jenkins)

---

---
url: /docs/services/joomla.md
description: >-
  Host Joomla CMS on Coolify for flexible content management, extensions,
  multilingual sites, and powerful website building with PHP framework.
---

# Joomla

## What is Joomla

Joomla! is the mobile-ready and user-friendly way to build your website. Choose from thousands of features and designs. Joomla! is free and open source.

## Links

* [Official Documentation](https://joomla.org?utm_source=coolify.io)

---

---
url: /docs/services/joplin.md
description: >-
  Deploy Joplin notes on Coolify for markdown note-taking, to-do lists,
  synchronization, end-to-end encryption, and cross-platform organization.
---

# Joplin

## What is Joplin

Self-hosted sync server for Joplin

## Links

* [Official Documentation](https://github.com/laurent22/joplin/blob/dev/packages/server/README.md?utm_source=coolify.io)

---

---
url: /docs/services/jupyter-notebook-python.md
description: >-
  Run Jupyter Notebook on Coolify for interactive Python development, data
  science workflows, visualization, and collaborative computational notebooks.
---

# Jupyter Notebook Python

## What is Jupyter Notebook Python

Jupyter Notebook is an open-source web application that allows you to create and share documents that contain live code, equations, visualizations, and narrative text.

## Links

* [Official Documentation](https://jupyter.org/?utm_source=coolify.io)

---

---
url: /docs/services/karakeep.md
description: >-
  Host KaraKeep password manager on Coolify for secure credential storage, team
  sharing, encrypted vaults, and self-hosted password management.
---

# KaraKeep

## What is KaraKeep?

KaraKeep is a self-hostable bookmark-everything app with AI-based automatic tagging. It serves as a comprehensive read-it-later service and alternative to Pocket or Omnivore. KaraKeep can automatically categorize and tag your saved content using AI, making it easy to organize and rediscover articles, videos, and other web content you want to save for later.

## Links

* [The official website](https://docs.karakeep.app?utm_source=coolify.io)
* [GitHub](https://github.com/karakeep-app/karakeep?utm_source=coolify.io)

---

---
url: /docs/services/keycloak.md
description: >-
  Deploy Keycloak on Coolify for identity and access management with SSO,
  OAuth2, SAML, user federation, and centralized authentication.
---

# Keycloak

## What is Keycloak

Keycloak is an open-source Identity and Access Management tool.

## Deployment Variants

Keycloak is available in two deployment configurations in Coolify:

### Keycloak (Default)

* **Database:** Embedded H2 (development)
* **Use case:** Development, testing, or evaluation purposes
* **Components:** Single Keycloak container with built-in H2 database

### Keycloak with PostgreSQL

* **Database:** PostgreSQL
* **Use case:** Production deployments requiring reliability, performance, and data persistence
* **Components:**
  * Keycloak container
  * PostgreSQL container
  * Automatic database configuration and health checks

## Links

* [Official Documentation](https://www.keycloak.org?utm_source=coolify.io)

---

---
url: /docs/databases/keydb.md
description: >-
  Deploy KeyDB on Coolify with high-performance multithreading, Redis
  compatibility, active replication, and FLASH storage support.
---

# KeyDB

## What is KeyDB

KeyDB is a high-performance fork of Redis, focusing on multithreading, memory efficiency, and high availability. It maintains API compatibility with Redis while offering improved performance, especially on multi-core systems. KeyDB introduces features like active replication, FLASH storage support, and subkey expires to enhance the capabilities of the traditional Redis model.

Designed to be a drop-in replacement for Redis, KeyDB aims to provide better resource utilization and scalability for applications requiring high-throughput in-memory data storage and processing.

## Links

* [The official website](https://keydb.dev/)
* [GitHub](https://github.com/EQ-Alpha/KeyDB)

---

---
url: /docs/services/kimai.md
description: >-
  Track time on Coolify with Kimai for project time tracking, invoicing,
  reporting, and team productivity management with mobile support.
---

![Kimai](https://raw.githubusercontent.com/kimai/www.kimai.org/refs/heads/main/images/kimai_logo.webp)

## What is Kimai?

Kimai makes time-tracking easy. An open-source solution for teams of all sizes.

## Screenshots

![Configurable Kimai Dashboard](https://raw.githubusercontent.com/kimai/www.kimai.org/refs/heads/main/images/screenshots/screenshot-dashboard.webp)

![Project detail-report screen](https://raw.githubusercontent.com/kimai/www.kimai.org/refs/heads/main/images/screenshots/screenshot-reporting.webp)

## Links

* [The official website](https://www.kimai.org/?utm_source=coolify.io)
* [GitHub](https://github.com/kimai/kimai)

---

---
url: /docs/services/kuzzle.md
description: >-
  Run Kuzzle backend on Coolify for real-time APIs, authentication, data
  storage, geofencing, and IoT platform with pub/sub messaging.
---

![Kuzzle](https://user-images.githubusercontent.com/7868838/103797784-32337580-5049-11eb-8917-3fcf4487644c.png)

## What is Kuzzle?

Kuzzle is a generic backend offering the basic building blocks common to every application.

Rather than developing the same standard features over and over again each time you create a new application, Kuzzle proposes them off the shelf, allowing you to focus on building high-level, high-value business functionalities.

## Features

Kuzzle enables you to build modern web applications and complex IoT networks in no time.

* API First: use a standardised multi-protocol API.
* Persisted Data: store your data and perform advanced searches on it.
* Realtime Notifications: use the pub/sub system or subscribe to database notifications.
* User Management: login, logout and security rules are no more a burden.
* Extensible: develop advanced business feature directly with the integrated framework.
* Client SDKs: use our SDKs to accelerate the frontend development.

## Links

* [The official website](https://kuzzle.io/)
* [GitHub](https://github.com/kuzzleio/kuzzle)

---

---
url: /docs/services/labelstudio.md
description: >-
  Deploy Label Studio on Coolify for ML data labeling, annotation workflows,
  image tagging, NLP tasks, and AI training dataset preparation.
---

# What is Label Studio?

## Screenshots

## Links

* [The official website](https://labelstud.io/)

---

---
url: /docs/services/langfuse.md
description: >-
  Host Langfuse LLM observability on Coolify for prompt management, tracing,
  debugging, and analytics for LangChain and OpenAI applications.
---

# What is Langfuse?

[Langfuse](https://langfuse.com/) is an **[open-source](https://github.com/langfuse/langfuse) LLM engineering platform** that empowers teams to collaboratively **debug**, **analyze**, and **iterate** on their LLM applications.

It accelerates the development workflow by providing tools for **observability**, **tracing**, **prompt management**, **evaluation**, and **analytics**.

## Key Features

### Observability and Tracing

* **Insights**: Gain a granular understanding of your LLM's behavior with detailed tracing capabilities.
* **Integrations**: Seamlessly integrate with popular frameworks like [LangChain](https://langfuse.com/docs/integrations/langchain), [Llama Index](https://langfuse.com/docs/integrations/llama-index), and [OpenAI](https://langfuse.com/docs/integrations/openai).

### Prompt Management

* **Linked Tracing**: Connect prompt versions with tracing data for a holistic view of interactions.
* **Zero Latency**: Experience prompt management without added latency in your applications.
* **Efficient Management**: Organize and version your prompts to optimize model performance.

### Evaluation and Analytics

* **Model-Based Evaluations**: Utilize built-in tools or integrate external pipelines like [UpTrain](https://langfuse.com/guides/cookbook/evaluation_with_uptrain) and [Ragas](https://langfuse.com/guides/cookbook/evaluation_of_rag_with_ragas).
* **Custom Metrics**: Define and track custom scores and annotations to measure performance.
* **Analytics Dashboard**: Access visualizations and reports to monitor usage, costs, and model effectiveness.

## Get Started

* Visit the [Langfuse docs](https://langfuse.com/docs) to get started.
*

---

---
url: /docs/applications/laravel.md
description: >-
  Deploy Laravel PHP applications on Coolify with Nixpacks, queue workers,
  scheduler, supervisor, database, and Redis integration.
---

# Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling.

Example repository [here](https://github.com/coollabsio/coolify-examples/tree/main/laravel).

## Deploy with Nixpacks

### Requirements

* Set `Build Pack` to `nixpacks`
* Set the required [environment variables](#environment-variables)
* Add `nixpacks.toml` with the following [configuration](#all-in-one-container)
* Set `Ports Exposes` to `80`

### Environment Variables

If your application needs a database or Redis, you can simply create them beforehand in the Coolify dashboard.

You will receive the connection strings which you can use in your application and set them as environment variables:

```bash
DB_CONNECTION=mysql
DB_HOST=<DB_HOST>
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=

REDIS_HOST=<REDIS_HOST>
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### All-in-one container

If you would like to start queue worker, scheduler, etc within one container (recommended), then you can place a `nixpacks.toml` inside your repository with the following value.

```toml
[phases.setup]
nixPkgs = ["...", "python311Packages.supervisor"]

[phases.build]
cmds = [
    "mkdir -p /etc/supervisor/conf.d/",
    "cp /assets/worker-*.conf /etc/supervisor/conf.d/",
    "cp /assets/supervisord.conf /etc/supervisord.conf",
    "chmod +x /assets/start.sh",
    "..."
]

[start]
cmd = '/assets/start.sh'

[staticAssets]
"start.sh" = '''
#!/bin/bash

# Transform the nginx configuration
node /assets/scripts/prestart.mjs /assets/nginx.template.conf /etc/nginx.conf

# Start supervisor
supervisord -c /etc/supervisord.conf -n
'''

"supervisord.conf" = '''
[unix_http_server]
file=/assets/supervisor.sock

[supervisord]
logfile=/var/log/supervisord.log
logfile_maxbytes=50MB
logfile_backups=10
loglevel=info
pidfile=/assets/supervisord.pid
nodaemon=false
silent=false
minfds=1024
minprocs=200

[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface

[supervisorctl]
serverurl=unix:///assets/supervisor.sock

[include]
files = /etc/supervisor/conf.d/*.conf
'''

"worker-nginx.conf" = '''
[program:worker-nginx]
process_name=%(program_name)s_%(process_num)02d
command=nginx -c /etc/nginx.conf
autostart=true
autorestart=true
stdout_logfile=/var/log/worker-nginx.log
stderr_logfile=/var/log/worker-nginx.log
'''

"worker-phpfpm.conf" = '''
[program:worker-phpfpm]
process_name=%(program_name)s_%(process_num)02d
command=php-fpm -y /assets/php-fpm.conf -F
autostart=true
autorestart=true
stdout_logfile=/var/log/worker-phpfpm.log
stderr_logfile=/var/log/worker-phpfpm.log
'''

"worker-laravel.conf" = '''
[program:worker-laravel]
process_name=%(program_name)s_%(process_num)02d
command=bash -c 'exec php /app/artisan queue:work --sleep=3 --tries=3 --max-time=3600'
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
numprocs=12 # To reduce memory/CPU usage, change to 2.
startsecs=0
stopwaitsecs=3600
stdout_logfile=/var/log/worker-laravel.log
stderr_logfile=/var/log/worker-laravel.log
'''

"php-fpm.conf" = '''
[www]
listen = 127.0.0.1:9000
user = www-data
group = www-data
listen.owner = www-data
listen.group = www-data
pm = dynamic
pm.max_children = 50
pm.min_spare_servers = 4
pm.max_spare_servers = 32
pm.start_servers = 18
clear_env = no
php_admin_value[post_max_size] = 35M
php_admin_value[upload_max_filesize] = 30M
'''

"nginx.template.conf" = '''
user www-data www-data;
worker_processes 5;
daemon off;

worker_rlimit_nofile 8192;

events {
  worker_connections  4096;  # Default: 1024
}

http {
    include    $!{nginx}/conf/mime.types;
    index    index.html index.htm index.php;

    default_type application/octet-stream;
    log_format   main '$remote_addr - $remote_user [$time_local]  $status '
        '"$request" $body_bytes_sent "$http_referer" '
        '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx-access.log;
    error_log /var/log/nginx-error.log;
    sendfile     on;
    tcp_nopush   on;
    server_names_hash_bucket_size 128; # this seems to be required for some vhosts

    server {
        listen ${PORT};
        listen [::]:${PORT};
        server_name localhost;

        $if(NIXPACKS_PHP_ROOT_DIR) (
            root ${NIXPACKS_PHP_ROOT_DIR};
        ) else (
            root /app;
        )

        add_header X-Content-Type-Options "nosniff";

        client_max_body_size 35M;
     
        index index.php;
     
        charset utf-8;
     

        $if(NIXPACKS_PHP_FALLBACK_PATH) (
            location / {
                try_files $uri $uri/ ${NIXPACKS_PHP_FALLBACK_PATH}?$query_string;
            }
        ) else (
          location / {
                try_files $uri $uri/ /index.php?$query_string;
           }
        )
     
        location = /favicon.ico { access_log off; log_not_found off; }
        location = /robots.txt  { access_log off; log_not_found off; }
     
        $if(IS_LARAVEL) (
            error_page 404 /index.php;
        ) else ()
     
        location ~ \.php$ {
            fastcgi_pass 127.0.0.1:9000;
            fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
            include $!{nginx}/conf/fastcgi_params;
            include $!{nginx}/conf/fastcgi.conf;
        }
     
        location ~ /\.(?!well-known).* {
            deny all;
        }
    }
}
'''
```

### With Inertia.js

When using Laravel with [Inertia.js](https://inertiajs.com/), you may need to specify some additional configuration in your `nixpacks.toml` file.

#### Increasing the NGINX buffer size for Inertia requests

Because of a [known issue](https://github.com/inertiajs/inertia-laravel/issues/529) with Inertia.js and default NGINX configuration, you may need to increase the buffer size for NGINX to handle Inertia requests.

```diff toml
"nginx.template.conf" = '''
# ...
http {
    # ...
    server {
        # ...
        location ~ \.php$ {
+            fastcgi_buffer_size 8k;
            fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
            include $!{nginx}/conf/fastcgi_params;
            include $!{nginx}/conf/fastcgi.conf;

            # ...
        }
    }
}
```

#### Inertia SSR

If you are using Inertia.js with [server-side rendering](https://inertiajs.com/server-side-rendering), you should add another worker in your `nixpacks.toml` file to automatically start your SSR server.

```toml
"worker-inertia-ssr.conf" = '''
[program:inertia-ssr]
process_name=%(program_name)s_%(process_num)02d
command=bash -c 'exec php /app/artisan inertia:start-ssr'
autostart=true
autorestart=true
stderr_logfile=/var/log/worker-inertia-ssr.log
stdout_logfile=/var/log/worker-inertia-ssr.log
'''
```

> \[!NOTE]
> By default, Nixpacks runs the command `npm run build` to build your application during the deployment. Ensure that your `build` script in `package.json` contains the necessary build commands for server-side rendering. If you use one of the official starter kits including Inertia.js, change your scripts like this:
>
> ```diff
> "scripts": {
> -     "build": "vite build",
> +     "build": "vite build && vite build --ssr",
>     "build:ssr": "vite build && vite build --ssr",
> }
> ```
>
> Alternatively, if you don't want to adapt your default `build` script in `package.json`, you can add the correct build command for server-side rendering directly in your `nixpacks.toml` configuration file.
>
> ```diff
> [phases.build]
> cmds = [
> +    "npm run build:ssr",
>    "mkdir -p /etc/supervisor/conf.d/",
>    "cp /assets/worker-*.conf /etc/supervisor/conf.d/",
>    "cp /assets/supervisord.conf /etc/supervisord.conf",
>    "chmod +x /assets/start.sh",
>    "..."
> ]
> ```

### Persistent php.ini customizations

If you want to customize settings from your php.ini file, you can easily do so by using the `php_admin_value` directive and appending them to your `php-fpm.conf` file like this:

```toml
"php-fpm.conf" = '''
[www]
listen = 127.0.0.1:9000
user = www-data
group = www-data
listen.owner = www-data
listen.group = www-data
pm = dynamic
pm.max_children = 50
pm.min_spare_servers = 4
pm.max_spare_servers = 32
pm.start_servers = 18
clear_env = no

php_admin_value[memory_limit] = 512M
php_admin_value[max_execution_time] = 60
php_admin_value[max_input_time] = 60
php_admin_value[post_max_size] = 256M
'''
```

## Deploy with Dockerfile and Nginx Unit

### Prerequisites

1. Create a new resource from a private or public repository.
2. Set the `Ports Exposes` field to `8000`, for example.
3. Set default environment variables using `Developer view` in `Environment Variables`:

```sh
APP_DEBUG=false
APP_ENV=staging
APP_KEY= #YourAppKey
APP_MAINTENANCE_DRIVER=file
APP_NAME=Laravel
CACHE_STORE=file
DB_CONNECTION= #YourDbConnection
DB_DATABASE= #YourDb
DB_HOST= #YourDbHost
DB_PASSWORD= #YourDbPassword
DB_PORT= #YourDbPort
DB_USERNAME= #YourDbUsername
FILESYSTEM_DISK=public
MAIL_MAILER=log
SESSION_DRIVER=file
```

4. Create a `Dockerfile` in the root of your project with the following content:

```Dockerfile
FROM unit:1.34.1-php8.3

RUN apt update && apt install -y \
    curl unzip git libicu-dev libzip-dev libpng-dev libjpeg-dev libfreetype6-dev libssl-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pcntl opcache pdo pdo_mysql intl zip gd exif ftp bcmath \
    && pecl install redis \
    && docker-php-ext-enable redis

RUN echo "opcache.enable=1" > /usr/local/etc/php/conf.d/custom.ini \
    && echo "opcache.jit=tracing" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "opcache.jit_buffer_size=256M" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "memory_limit=512M" > /usr/local/etc/php/conf.d/custom.ini \        
    && echo "upload_max_filesize=64M" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "post_max_size=64M" >> /usr/local/etc/php/conf.d/custom.ini

COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

WORKDIR /var/www/html

RUN mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache

RUN chown -R unit:unit /var/www/html/storage bootstrap/cache && chmod -R 775 /var/www/html/storage

COPY . .

RUN chown -R unit:unit storage bootstrap/cache && chmod -R 775 storage bootstrap/cache

RUN composer install --prefer-dist --optimize-autoloader --no-interaction

COPY unit.json /docker-entrypoint.d/unit.json

EXPOSE 8000

CMD ["unitd", "--no-daemon"]
```

3. Create a `unit.json` file (lowercase) at the root of your project with the following content.

```json
{
    "listeners": {
        "*:8000": {
            "pass": "routes",
            "forwarded": {
                "protocol": "X-Forwarded-Proto",
                "source": ["<Load balancer IP, Subnet etc.>"]
            }
        }
    },

    "routes": [
        {
            "match": {
                "uri": "!/index.php"
            },
            "action": {
                "share": "/var/www/html/public$uri",
                "fallback": {
                    "pass": "applications/laravel"
                }
            }
        }
    ],

    "applications": {
        "laravel": {
            "type": "php",
            "root": "/var/www/html/public/",
            "script": "index.php"
        }
    }
}
```

> \[!NOTE]
> When using docker-compose for deployment, then there might be an issue with `Mixed content error` when some of the assets are requested via `http://` instead of `https://`. To avoid that, find your load balancer/proxy subnet or IP address and add it to the unit.config to explicitly tell unit to forward the correct headers to Laravel. Laravel also has to be configured trust proxies. More on that [here](https://laravel.com/docs/12.x/requests#configuring-trusted-proxies).
>
> ```json
> "listeners": {
>        "*:8000": {
>            "pass": "routes",
>            "forwarded": {
>                "protocol": "X-Forwarded-Proto",
>                "source": ["<Load balancer IP, Subnet etc.>"]
>            }
>        }
>    },
> ```

4. Set Post-deployment to:

```sh
php artisan optimize:clear && php artisan config:clear && php artisan route:clear && php artisan view:clear && php artisan optimize
```

---

---
url: /docs/services/leantime.md
description: >-
  Manage projects on Coolify with Leantime featuring tasks, gantt charts, time
  tracking, ideas management, and lean project management approach.
---

## What is Leantime?

Leantime is a goals focused project management system for non-project managers. Building with ADHD, Autism, and dyslexia in mind.

## Screenshots

## Links

* [The official website](https://leantime.io?utm_source=coolify.io)
* [GitHub](https://github.com/leantime/leantime?utm_source=coolify.io)

---

---
url: /docs/troubleshoot/dns-and-domains/lets-encrypt-not-working.md
description: >-
  Fix Let's Encrypt SSL failures by opening ports 80/443, checking DNS records,
  verifying Cloudflare settings, and troubleshooting challenges.
---

# Let's Encrypt Not Generating SSL Certificates

If you are using the default settings for the Coolify proxy and your website suddenly shows a warning about an insecure connection, it is most likely that your website is using a self-signed certificate from the Coolify proxy. This guide will help you fix the issue.

## 1. Understand the Domain Ownership Challenges

Coolify uses [Let's Encrypt](https://letsencrypt.org?utm_source=coolify.io) to generate SSL certificates for your domains.

By default, Let's Encrypt uses the **HTTP challenge** for domain validation, but some users might use the **TLS-ALPN-01 challenge**. Here's a breakdown:

* **HTTP Challenge**:
  * Let's Encrypt sends an HTTP request to your server on port 80 with a unique token. If your server responds with the correct token, it confirms domain ownership, and the certificate is issued.
* **TLS-ALPN-01 Challenge**:
  * Let's Encrypt validates your domain over port 443 (HTTPS), during the TLS handshake, Let's Encrypt expects your server to provide a special response. If the server provides the correct response, the domain is verified, and the certificate is issued.
  * If this step fails, youâ€™ll get an SSL handshake error.

## 2. Check Port Accessibility

Ensure the appropriate ports are open for the respective challenge methods:

* **For the HTTP Challenge**: Port 80 (HTTP) needs to be open and accessible from the internet. If port 80 is closed or blocked by a firewall, Let's Encrypt cannot verify your domain and generate the SSL certificate.

* **For the TLS-ALPN-01 Challenge**: Port 443 (HTTPS) needs to be open and accessible from the internet. If port 443 is closed or blocked by a firewall, Let's Encrypt cannot verify your domain and generate the SSL certificate.

## 3. Usage of Third-Party Proxy

If you are proxying your website through a third-party service like [Cloudflare](https://www.cloudflare.com?utm_source=coolify.io), Let's Encrypt might fail to validate your domain due to the proxy interfering with the **HTTP** or **TLS-ALPN-01** challenge. In that case, you must either use a DNS challenge or stop proxying your domain through the third-party service.

## 4. Check Let's Encrypt Service Status

Sometimes, Let's Encrypt might be having issues on their end. Check the Let's Encrypt status from [here](https://letsencrypt.status.io?utm_source=coolify.io). If there is an issue, wait for them to fix it and try again once the issue is fixed.

## 5. Note on Certificate Validity

Let's Encrypt certificates are valid for 90 days. If your certificate is still valid, your domain may work fine even if requied port 80 is closed or your domain is being proxied. This is because Coolify will continue using the existing valid certificate until it expires.

However, if your domain has been working fine over HTTPS for several months and suddenly fails to generate a new SSL certificate, itâ€™s likely that the existing certificate has expired. At this point, Coolify wonâ€™t be able to generate a new certificate due to the issues mentioned earlier (like port 80 being closed or proxy interference).

## 6. Force Regenerate Certificates

If the certificates stored on your server are corrupted or outdated, you can delete them and force Coolify generate new ones.

* Open your server terminal and run:
  ```bash
  rm /data/coolify/proxy/acme.json
  ```
* Then, restart the Coolify proxy from the dashboard by clicking the Restart Proxy button.
  ::: details Guide: How to Restart Proxy from Dashboard?

  1. Select your server on the Coolify Dashboard


  2. Click on Restart Proxy button

     :::

## 7. Check Your WAF Settings

If you are using a Web Application Firewall (WAF) like [Cloudflare WAF](https://www.cloudflare.com/en-gb/application-services/products/waf/?utm_source=coolify.io), make sure it is not blocking Let's Encrypt requests.

## 8. Check Coolify Proxy logs

On the Coolify proxy logs check for error messages.

* If you see an error message with a 429 status code, it means that Let's Encrypt has rate-limited your server's IP address.

  * In this case, wait for a while and check your domain again. Most users won't encounter this, but it can happen if you are using a shared IP address.

* If you see an error message with a 403 status code, it means that requests from Let's Encrypt are blocked by something like a Web Application Firewall (WAF).
  ::: details Guide: How to check Coolify proxy logs?

  1. Select your server on the Coolify Dashboard


  2. Go to the proxy section and click the refresh button

     :::

## 9. Verify DNS Records

Let's Encrypt performs a DNS lookup to resolve the IP address of your server. If you have both **IPv4 (A record)** and **IPv6 (AAAA record)** configured to point to your server, Let's Encrypt will verify both records during the domain ownership challenge.

* **If both IPv4 and IPv6 are present**, Let's Encrypt may prefer to use **IPv6** for the challenge, but **both IPv4 and IPv6 should be able to complete the challenge**.

### Why This Matters:

If either the **IPv4** or **IPv6** address is misconfigured, the challenge may fail. For example:

* If your domain resolves to both **IPv4** and **IPv6**, but the **IPv6 (AAAA) record** has **port 80 closed**, the HTTP challenge will fail. Similarly, if **port 443** is closed for IPv6, the TLS-ALPN challenge will fail, even if **IPv4** passes the challenge.

To ensure successful validation:

* Both **IPv4 (A record)** and **IPv6 (AAAA record)** must be able to serve the challenge file correctly.

If you donâ€™t need IPv6, you can remove the **AAAA record** from your DNS configuration. This will make Let's Encrypt use **IPv4** for the challenge.

## Support

If none of the above steps work, try these additional options:

* **Community Help:** Join our [Discord community](https://coolify.io/discord) and post in the support forum channel.
* **What to Share:** Include a description of your issue, any error messages, and the steps you have already tried.

---

---
url: /docs/services/librechat.md
description: >-
  Deploy LibreChat on Coolify for unified AI chat interface supporting GPT-4,
  Claude, Gemini, and local models with conversation management.
---

# LibreChat

## What is LibreChat?

LibreChat is a self-hosted, powerful, and privacy-focused chat UI for multiple AI models including OpenAI GPT, Anthropic Claude, Azure OpenAI, and many others. It provides a unified interface to interact with various AI providers while keeping your conversations private and under your control. LibreChat supports conversation threading, message editing, plugin integration, and customizable presets.

## Links

* [The official website](https://librechat.ai?utm_source=coolify.io)
* [GitHub](https://github.com/danny-avila/LibreChat?utm_source=coolify.io)

---

---
url: /docs/services/libreoffice.md
description: >-
  Run LibreOffice Online on Coolify for collaborative document editing,
  spreadsheets, presentations with web-based office suite interface.
---

# Libreoffice

## What is Libreoffice

LibreOffice is a free and powerful office suite.

## Links

* [Official Documentation](https://docs.linuxserver.io/images/docker-libreoffice/?utm_source=coolify.io)

---

---
url: /docs/services/libretranslate.md
description: >-
  Host LibreTranslate on Coolify for self-hosted translation API supporting 40+
  languages with privacy-focused machine translation service.
---

# Libretranslate

## What is Libretranslate

Free and open-source machine translation API, entirely self-hosted.

## Links

* [Official Documentation](https://libretranslate.com/docs/?utm_source=coolify.io)

---

---
url: /docs/services/limesurvey.md
description: >-
  Create surveys on Coolify with LimeSurvey featuring questionnaire design, data
  collection, analysis, and professional survey research tools.
---

## What is LimeSurvey?

A powerful, open-source survey platform.

A free alternative to SurveyMonkey, Typeform, Qualtrics, and Google Forms, making it simple to create online surveys and forms with unmatched flexibility.

## Links

* [The official website](https://www.limesurvey.org/?utm_source=coolify.io)
* [GitHub](https://github.com/LimeSurvey/LimeSurvey?utm_source=coolify.io)

---

---
url: /docs/services/listmonk.md
description: >-
  Run Listmonk newsletter on Coolify for email campaigns, subscriber management,
  templates, analytics, and high-performance mailing lists.
---

![Listmonk](https://user-images.githubusercontent.com/547147/231084896-835dba66-2dfe-497c-ba0f-787564c0819e.png)

## What is Listmonk?

Self-hosted newsletter and mailing list manager.

## Screenshots

![Listmonk Preview](https://user-images.githubusercontent.com/547147/134939475-e0391111-f762-44cb-b056-6cb0857755e3.png)

## Links

* [The official website](https://listmonk.app/)
* [GitHub](https://github.com/knadh/listmonk)

---

---
url: /docs/services/litellm.md
description: >-
  Deploy LiteLLM proxy on Coolify for unified LLM API with 100+ models, load
  balancing, fallbacks, and standardized OpenAI-compatible interface.
---

# What is Litellm?

LiteLLM is an open-source LLM Gateway to manage authentication, loadbalancing, and spend tracking across 100+ LLMs. All in the OpenAI format.

## Screenshots

## Links

* [The official website](https://docs.litellm.ai?utm_source=coolify.io)

---

---
url: /docs/services/litequeen.md
description: >-
  Host LiteQueen lightweight CMS on Coolify for fast content management,
  blogging, and simple website administration with minimal resource usage.
---

# Litequeen

## What is Litequeen

Lite Queen is an open-source SQLite database management software that runs on your server.

## Links

* [Official Documentation](https://litequeen.com/?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/how-to/hetzner-loadbalancing.md
description: >-
  Deploy scalable load-balanced applications on Hetzner Cloud with Coolify
  including TLS termination, health checks, database setup, and firewall
  configuration.
---

# Load Balancing on Hetzner

Hetzner Cloud is a cloud hosting provider that offers a wide range of services. In this guide, we will show you how to deploy a load-balanced application with Coolify on Hetzner Cloud.

## Introduction

Your application is growing, and you need to scale it. One of the most common ways to scale an application is to use a load balancer. A load balancer distributes incoming traffic across multiple servers, ensuring that no single server is overwhelmed. This can help improve the performance and reliability of your application.

In this guide, we will show you how to deploy a load-balanced application with Coolify on Hetzner Cloud. We will use two (or more) servers to host our application and a load balancer to distribute incoming traffic. We will also show you how to set up a database server if you need one.

::: success Tip
The whole infrastructure costs around ~15â‚¬ per month.
:::

## Requirements

* A domain name managed by Hetzner Cloud
* 2 (or more) servers on Hetzner Cloud
* A load balancer on Hetzner Cloud
* Firewall rules to restrict access to your servers
* Optional: A database server on Hetzner Cloud

## Steps

1. ### Buy Servers

   First, you need to buy two (or more) servers on Hetzner Cloud. You can choose the server type and location based on your requirements. Make sure to choose servers with enough resources to run your application.

   ::: warning Caution
   Make sure you create and attach a private network to your servers. This will allow your servers to communicate with each other using a private network.
   :::

   If you don't have an account on Hetzner Cloud, you can sign up with this [referral link](https://coolify.io/hetzner).

2. ### Add & validate them in Coolify

   Once you have bought the servers, you need to add them to Coolify. You can do this by clicking on the `Add Server` button in the Coolify dashboard and following the instructions.

   Coolify will automatically install the necessary software on your servers.

3. ### Optional: Deploy your database

   It is preferable to have a separate database server for your application. Not just for performance reasons, but also for security reasons. Also in this way you can connect your applications to a centralized database server.

   Skip this step if you don't need a database server or if you already have one hosted elsewhere.

   Once you have bought the database server, and added it to Coolify, deploy your preferable database type (MySQL, PostgreSQL, etc.) on it.

   ::: warning Caution
   We won't use a reverse proxy in this guide. We will bind the database to the public IP address of the server. We will use a firewall to restrict access to the database server.

   You can stop them on the `Server` tab and switch to a `None` proxy type.
   :::

   Make sure you set the `Ports Mappings` correctly to allow your application servers to connect to the database server.

   * PostgreSQL: `5432:5432`
   * MySQL: `3306:3306`
   * MariaDB: `3306:3306`
   * MongoDB: `27017:27017`

4. ### Deploy your applications

   Now it's time to deploy your application on the app servers. Details of deploying your application will depend on the type of application you are deploying.

   With Coolify, you can attach more than one server to the same application. This will allow you to deploy your application on multiple servers.

   ::: warning Caution
   We won't use a reverse proxy in this guide. We will bind the application to the public IP address of the server, as the load balancer will handle the routing.

   You can stop them on the `Server` tab and switch to a `None` proxy type.
   :::

   Make sure you set the `Ports Mappings` correctly to forward your application ports to the public IP address of the server.

   If your application uses a database, make sure you update the database connection string to point to the database server.
   ::: success Tip
   Hetzner Cloud has a private network feature that allows you to connect your servers using a private network. This can help improve the security and performance of your application.

   Make sure you enable the private network feature on your servers and use it in the database connection string.
   :::

   Test if your application is working correctly by accessing the public IP address and port of the server in your browser.

5. ### Add & configure the loadbalancer

   Now it's time to add a load balancer to distribute incoming traffic across your servers.

   This loadbalancer will do the following:

   * Distribute incoming traffic across your servers
   * Terminates TLS connections (makes your application secure with HTTPS and forwards the traffic to your servers over HTTP)
   * Health checks your servers and routes traffic to healthy servers

   Your application is running on `port 8000` on both servers and you have a domain name `example.com`.

   1. Go to the Hetzner Cloud Console and click on `Load Balancers` in the left sidebar.
   2. Click on the `Create Load Balancer` button.
   3. Select a region where your servers are located.
   4. Select the private network that you have created for your servers.
   5. Select all servers in the targets section. **Important: `(use the private network)`.**
   6. In the services, delete the default service and add a `TLS Termination` predefined service.
   7. As `Destination Port` enter `8000` (source port should be `443`).
   8. Add a certificate for your domain name. It will generate a certificate for your domain name using Let's Encrypt.
   9. In the `health check` section, configure the health check endpoint to your application health check endpoint. (just an endpoint that returns `200 OK`).
   10. Optional: Sticky sessions can be enabled, which will make sure that a user is always routed to the same server for a time period, otherwise, the load balancer will distribute the traffic randomly across your servers.
   11. Choose an algorithm.
   12. And finally name your load balancer and click on `Create & Buy now`.

   Wait for the load balancer to be created and healthy. Once it's healthy, you can check if your application is accessible via the loadbalancer's IP address.

6. ### Setup DNS

   Now it's time to point your domain name to the `load balancer's IP address`. You can do this by adding an `A` record to your domain name provider's DNS settings.

   1. Go to your DNS settings.
   2. Add an `A` record with the domain name and the value of the load balancer's IP address.
   3. Save the changes and wait for the DNS changes to propagate.

   Once the DNS changes have propagated, you should be able to access your application using your domain name.

7. ### Setup Firewall

   Hetzner Cloud offers a firewall feature that allows you to restrict access to your servers. We will use this feature to restrict access to your servers.

   As the load balancer communicates with your servers over the private network, we only need to add rules for the public IP addresses.

   The `Inbound` rules includes everything that is allowed. Everyting else is blocked by default.

   1. Go to the Hetzner Cloud Console and click on `Firewalls` in the left sidebar.
   2. Click on the `Create Firewall` button.
   3. Add SSH access rule for your IP address to the `Inbound` rules.
   4. Add your servers to the `Apply rule` section.
   5. Name your firewall and click on `Create Firewall`.

   ::: success Tip
   Optional: You can add more rules to allow access to specific ports or IP addresses if needed.
   :::

---

---
url: /docs/knowledge-base/proxy/traefik/load-balancing.md
description: >-
  Configure Traefik load balancing in Coolify across multiple servers or
  containers with dynamic configuration, HTTPS support, and health monitoring.
---

# Load-balancing

You can easily use Traefik to loadbalance an application between:

* 2+ servers
* 2+ containers in one server

## 2+ servers

### Prerequisites

1. Make sure you set the right DNS record for your domain. Your loadbalanced domain should point to the server's IP address where you are setting up the loadbalancer.
2. You must deploy your application to more than one servers: read more [here](/knowledge-base/server/multiple-servers).
3. Make sure Traefik is running on all servers.
4. Set your `fqdn` to the fqdn you would like to use to reach your application.
5. After your application is deployed on all servers, you need to make a dynamic configuration for Traefik to loadbalance between your servers in the `/data/coolify/proxy/dynamic` directory.

### Dynamic Configuration

On your Coolify's UI, you can go the your Server settings / Proxy tab where you can add the dynamic configuration.

The following configuration is valid if you would like to use https.

```yaml {16,26,32,33}
http:
  middlewares:
    redirect-to-https:
      redirectscheme:
        scheme: https
    gzip:
      compress: true
  routers:
    lb-http:
      middlewares:
        - redirect-to-https
      entryPoints:
        - http
      service: noop
      # Change <CHANGE_THIS_TO_YOUR_DOMAIN> to your domain, like `example.com` without `https://`
      rule: Host(`<CHANGE_THIS_TO_YOUR_DOMAIN>`)
    lb-https:
      middlewares:
        - gzip
      entryPoints:
        - https
      service: lb-https
      tls:
        certResolver: letsencrypt
      # Change <CHANGE_THIS_TO_YOUR_DOMAIN> to your domain, like `example.com` without `https://`
      rule: Host(`<CHANGE_THIS_TO_YOUR_DOMAIN>`)
  services:
    lb-https:
      loadBalancer:
        servers:
          # Change <CHANGE_THIS_TO_YOUR_IP_ADDRESS> to your servers IP addresses
          - url: 'http://<CHANGE_THIS_TO_YOUR_IP_ADDRESS>'
          - url: 'http://<CHANGE_THIS_TO_YOUR_IP_ADDRESS>'
          # Add any number of servers you want to loadbalance between
    noop:
      loadBalancer:
        servers:
          - url: ''
```

The following configuration is valid if you would like to use http.

```yaml {13,19,20}
http:
  middlewares:
    gzip:
      compress: true
  routers:
    lb-http:
      middlewares:
        - gzip
      entryPoints:
        - http
      service: lb-http
      # Change <CHANGE_THIS_TO_YOUR_DOMAIN> to your domain, like `example.com` without `http://`
      rule: Host(`<CHANGE_THIS_TO_YOUR_DOMAIN>`)
  services:
    lb-http:
      loadBalancer:
        servers:
          # Change <CHANGE_THIS_TO_YOUR_IP_ADDRESS> to your servers IP addresses
          - url: 'http://<CHANGE_THIS_TO_YOUR_IP_ADDRESS>'
          - url: 'http://<CHANGE_THIS_TO_YOUR_IP_ADDRESS>'
          # Add any number of servers you want to loadbalance between
```

## 2+ containers in one server

### Prerequisites

1. Make sure you set the right DNS record for your domain. Your loadbalanced domain should point to the server's IP address where you are setting up the loadbalancer.
2. You must deploy your application to more than one containers in one server.
3. Make sure Traefik is running on the server.

### Dynamic Configuration

The following configuration is valid if you would like to use https.

```yaml {18,26,34,35}
http:
  middlewares:
    redirect-to-https:
      redirectscheme:
        scheme: https
    gzip:
      compress: true
  routers:
    lb-https:
      tls:
        certResolver: letsencrypt
      middlewares:
        - gzip
      entryPoints:
        - https
      service: lb-https
      # Change <CHANGE_THIS_TO_YOUR_DOMAIN> to your domain, like `example.com` without `http://`
      rule: Host(`<CHANGE_THIS_TO_YOUR_DOMAIN>`)
    lb-http:
      middlewares:
        - redirect-to-https
      entryPoints:
        - http
      service: noop
      # Change <CHANGE_THIS_TO_YOUR_DOMAIN> to your domain, like `example.com` without `http://`
      rule: Host(`<CHANGE_THIS_TO_YOUR_DOMAIN>`)
  services:
    lb-https:
      loadBalancer:
        servers:
          # Change <UUID_OR_HOST.DOCKER.INTERNAL>:<PORT> to your containers UUID or host.docker.internal and port
          # UUID is when you mapped a port to the host system
          # host.docker.internal is when you are not exposed any port to the host system
          - url: 'http://<UUID_OR_HOST.DOCKER.INTERNAL>:<PORT>'
          - url: 'http://<UUID_OR_HOST.DOCKER.INTERNAL>:<PORT>'
          # Add any number of containers you want to loadbalance between
    noop:
      loadBalancer:
        servers:
          - url: ''
```

The following configuration is valid if you would like to use http.

```yaml {13,21,22}
http:
  middlewares:
    gzip:
      compress: true
  routers:
    lb-http:
      middlewares:
        - gzip
      entryPoints:
        - http
      service: lb-http
      # Change <CHANGE_THIS_TO_YOUR_DOMAIN> to your domain, like `example.com` without `http://`
      rule: Host(`<CHANGE_THIS_TO_YOUR_DOMAIN>`)
  services:
    lb-http:
      loadBalancer:
        servers:
          # Change <UUID_OR_HOST.DOCKER.INTERNAL>:<PORT> to your containers UUID or host.docker.internal and port
          # UUID is when you mapped a port to the host system
          # host.docker.internal is when you are not exposed any port to the host system
          - url: 'http://<UUID_OR_HOST.DOCKER.INTERNAL>:<PORT>'
          - url: 'http://<UUID_OR_HOST.DOCKER.INTERNAL>:<PORT>'
          # Add any number of containers you want to loadbalance between
```

---

---
url: /docs/services/lobe-chat.md
description: Here you can find the documentation for hosting LobeChat with Coolify.
---

# LobeChat

## What is LobeChat?

LobeChat is an open-source, modern AI chat framework built for everyone. It supports multi AI providers, knowledge base management, and plugin system to provide a comprehensive AI chat experience.

## Features

* **Multi-Provider Support**: Compatible with OpenAI, Claude, Gemini, and many other AI providers
* **Knowledge Base**: Built-in knowledge base management for enhanced AI responses
* **Plugin System**: Extensible plugin architecture for custom functionality
* **Modern UI**: Beautiful and responsive user interface
* **Self-Hosted**: Full control over your data and privacy
* **Multi-Modal**: Support for text, image, and file inputs

## Links

* [Official Website](https://chat.lobehub.com?utm_source=coolify.io)
* [Official Documentation](https://lobehub.com/docs?utm_source=coolify.io)
* [GitHub Repository](https://github.com/lobehub/lobe-chat?utm_source=coolify.io)

---

---
url: /docs/services/logto.md
description: >-
  Deploy Logto Auth0 alternative on Coolify with OIDC authentication,
  passwordless sign-in, RBAC, multi-tenancy, and customer identity management.
---

![Logto](https://github.com/logto-io/logto/raw/master/logo.png)

## What is Logto?

Logto is an Auth0 alternative designed for modern apps and SaaS products. It offers a seamless developer experience and is well-suited for individuals and growing companies.

ðŸ§‘â€ðŸ’» **Comprehensive frontend-to-backend identity solution**

* Enables OIDC-based authentication with Logto SDKs.
* Supports passwordless sign-in, along with various options like email, phone number, username, Google, Facebook, and other social sign-in methods.
* Offers beautiful UI components with customizable CSS to suit your business needs.

ðŸ“¦ **Out-of-the-box infrastructure**

* Includes a ready-to-use Management API, serving as your authentication provider, thus eliminating the need for extra implementation.
* Provides SDKs that seamlessly integrate your apps with Logto across multiple platforms and languages, tailored to your development environment.
* Offers flexible connectors that can be scaled with community contributions and customized with SAML, OAuth, and OIDC protocols.

ðŸ’» **Enterprise-ready solutions**

* Implements role-based access control (RBAC) for scalable role authorization, catering to a wide range of use cases.
* Facilitates user management and provides audit logs for understanding identity-related user information and maintaining security.
* Enables single sign-on (SSO) and multi-factor authentication (MFA) without extra coding.
* Leverages Logto Organizations to build multi-tenancy apps with ease.

In a more approachable way, we refer to this solution as "[Customer Identity Access Management (CIAM)](https://en.wikipedia.org/wiki/Customer_identity_access_management)" or simply, the "Customer Identity Solution."

## Links

* [The official website](https://logto.io)
* [GitHub](https://github.com/logto-io/logto)

---

---
url: /docs/services/lowcoder.md
description: >-
  Build internal tools on Coolify with Lowcoder low-code platform featuring
  drag-and-drop UI, database queries, and custom application development.
---

# Lowcoder

## What is Lowcoder

Lowcoder (forked from OpenBlocks) is a self-hosted, open-source, low-code platform for building internal tools.

## Links

* [Official Documentation](https://docs.lowcoder.cloud/?utm_source=coolify.io)

---

---
url: /docs/services/mailpit.md
description: >-
  Run Mailpit SMTP testing on Coolify for email testing, preview, debugging with
  web UI for development environments without sending real emails.
---

# What is Mailpit?

Mailpit is a self-hosted email and SMTP testing tool with a web interface.

## Screenshots

![Mailpit preview](https://raw.githubusercontent.com/axllent/mailpit/develop/server/ui-src/screenshot.png)

## Links

* [The official website](https://mailpit.axllent.org)
* [GitHub](https://github.com/axllent/mailpit)

---

---
url: /docs/knowledge-base/destinations/manage.md
description: >-
  Manage Coolify destinations including editing, deleting, resource assignment,
  and connecting service stacks to predefined Docker networks.
---

# Managing Destinations

Learn how to manage your existing destinations in Coolify, and how to assign resources to them.

## Viewing Destinations

### Destinations Overview

Navigate to **Destinations** to see all your destinations across all servers.


### Server-Specific Destinations

Navigate to **Servers** â†’ **\[Server Name]** â†’ **Destinations** to view destinations specific to that server.


## Editing & Deleting Destinations

Click on a destination to access its management page where you can either edit or delete it.

### Basic Information

* **Name**: Update the destination display name
* **Server IP**: View the server IP address where the destination is hosted (read-only)
* **Docker Network**: View the Docker network name (read-only)

### Before You Delete

#### Check for Active Resources

Coolify won't allow you to delete a destination that has active resources. Therefore, before deleting a destination, ensure it's not being used:

1. **Applications**: No applications deployed to this destination
2. **Databases**: No databases running in this destination
3. **Services**: No services configured for this destination

#### Resource Dependencies

Verify that no other resources depend on this destination, to avoid issues after deletion:

* **Environment Variables**: Check for hardcoded references
* **Network Dependencies**: Ensure no cross-destination communication
* **Proxies & Load Balancers**: Update load balancer and proxy configuration

## Assign Resources to a Destination

When you have more then one destination on a server, you will get prompted to select a destination when creating a new resource.

If your resource is already created, you can make a **Clone** of it to another destination:

1. Navigate to the resource's management page over the **Projects** tab.
2. Go to **Resource Operations**
3. Select the destination

::: warning
Cloning a resource to another destination will create a new instance of that resource. This will not move the resource or it's data but create a duplicate.
:::

### Service Stacks

Unlike applications or databases, service stacks are not by default connected to the assigned destination. This also includes applications using the [Docker Compose Build Pack](/applications/build-packs/docker-compose). Coolify creates an isolated network for each service stack, allowing you to run multiple instances of the same service on the same server without conflicts.

If you want to connect a service stack to a destination, enable [Connect to Predefined Networks](/knowledge-base/docker/compose#connect-to-predefined-networks) in it's settings. This allows the service stack to communicate with other resources on the same destination.

::: danger WARNING
Avoid defining network configurations directly in your service stack's `docker-compose.y[a]ml` and instead use Coolify's Destination settings to manage network connections. This could otherwise lead to undesired behavior, such as [Gateway Timeout](/troubleshoot/applications/gateway-timeout) errors.
:::

## Best Practices

1. **Naming Convention**: Use descriptive names for destinations
2. **Resource Organization**: Group related applications in the same destination
3. **Monitoring**: Regularly check destination health and resource usage
4. **Documentation**: Document purpose and configuration of each destination
5. **Cleanup**: Remove unused destinations to reduce server load

---

---
url: /docs/applications/ci-cd/github/manually-setup-github-app.md
description: >-
  Manually configure GitHub App integration with Coolify including webhook
  setup, private key generation, permissions, and installation ID configuration.
---

# Manually Setup GitHub App

This guide will show you how to manually setup an existing Github App or how to change a currently configured one.

Since `4.0.0-beta.399` you are able to change all the Github App details inside Coolify.

## On Github

1. Generate a Private Key on your Github App configuration page (if you already have one, ignore this).
2. Set the `Homepage URL` to `https://app.coolify.io`.
3. Set the `Setup URL` to the following: `https://app.coolify.io/webhooks/source/github/install?source=<source_uuid>` where `source_uuid` will be the newly created source in Coolify.
4. Activate `Webhook` and set the `Webhook URL` to `https://app.coolify.io/webhooks/source/github/events`
5. Set the `Webhook Secret`.
6. In the `Install App` section, Install the app to the organization you want to use.
7. Copy the `Installation ID` from the URL of the page after you installed the Github App.
8. In the `Permissions` section, set the following permissions:
   Repository permissions:
   * Contents: read
   * Metadata: read
   * Pull Request: read & write (optional, if you want to use the pull request feature)
     Account permissions:
   * Email addresses: read
9. In the `Subscribe to events` section, enable tho following events:
   * Push
   * Pull Request (optional, if you want to use the pull request feature)

## On Coolify

0. Add the `Private Key` generated in the previous step as a new `Private Key` in the `Keys & Tokens` section.
1. Go to the `Sources` page and click on the `+` button or edit the existing one.
2. Fill the name and the organization name (optional). Press `Continue`.
3. Click on the `Continue` button on the `Manual Installation` section.
4. Enter the `Github App Name`, `App ID`, `Installation ID`, `Client ID`, `Client Secret` , `Webhook Secret` from the GitHub App configuration page.
5. Select the `Private Key` you added in step 0 and `Save`.
6. If you filled everything correctly, click on the `Sync Name` button. If no errors, then you are done.

---

---
url: /docs/databases/mariadb.md
description: >-
  Deploy MariaDB databases on Coolify with MySQL compatibility, enhanced
  performance, additional storage engines, and automated backups.
---

# MariaDB

## What is MariaDB

MariaDB is an open-source fork of MySQL, designed to remain free and open-source. It aims to be a drop-in replacement for MySQL with enhanced features and performance. MariaDB maintains high compatibility with MySQL while offering additional storage engines, performance improvements, and features.

Started by core members of MySQL, MariaDB provides a robust and scalable database solution suitable for a wide range of applications.

## Links

* [The official website](https://mariadb.org/)
* [GitHub](https://github.com/MariaDB/server)

---

---
url: /docs/services/marimo.md
description: >-
  Deploy Marimo reactive notebooks on Coolify for Python data science with
  interactive notebooks, reproducible execution, and git-friendly format.
---

## What is Marimo?

Marimo is an open-source reactive notebook for Python â€” reproducible, git-friendly, SQL built-in, executable as a script, and shareable as an app.

## Links

* [The official website](https://marimo.io/?utm_source=coolify.io)
* [GitHub](https://github.com/marimo-team/marimo?utm_source=coolify.io)

---

---
url: /docs/services/martin.md
description: >-
  Host Martin tile server on Coolify for serving PostGIS vector tiles, MBTiles,
  PMTiles with high performance for web mapping applications.
---

# Martin

## What is Martin

Martin is a tile server able to generate and serve vector tiles on the fly from large PostGIS databases, PMTiles (local or remote), and MBTiles files, allowing multiple tile sources to be dynamically combined into one.

## Links

* [Official Documentation](https://maplibre.org/martin/introduction.html?utm_source=coolify.io)

---

---
url: /docs/services/matrix.md
description: >-
  Run Matrix Synapse server on Coolify for decentralized chat, end-to-end
  encryption, federation, and secure real-time communication platform.
---

# Matrix

## What is Matrix?

Matrix is an open-source, decentralized communication protocol that enables secure, real-time communication. It provides end-to-end encrypted messaging, voice and video calls, file sharing, and room-based conversations. Matrix serves as an excellent alternative to proprietary platforms like Slack or Discord, offering federation capabilities that allow different Matrix servers to communicate with each other.

## Links

* [The official website](https://matrix.org?utm_source=coolify.io)
* [GitHub](https://github.com/matrix-org/synapse?utm_source=coolify.io)

---

---
url: /docs/services/mattermost.md
description: >-
  Deploy Mattermost team chat on Coolify for secure messaging, file sharing,
  integrations, and Slack alternative with on-premises control.
---

# Mattermost

## What is Mattermost

Mattermost is an open source, self-hosted Slack-alternative.

## Links

* [Official Documentation](https://docs.mattermost.com?utm_source=coolify.io)

---

---
url: /docs/services/mautic5.md
description: >-
  Deploy Mautic open-source marketing automation platform on Coolify for email
  campaigns, lead nurturing, contact management, and privacy-focused marketing
  workflows.
---

# Mautic

## What is Mautic

Mautic is the world's largest open-source marketing automation project, trusted by over 200,000 organizations worldwide. It provides a privacy-focused, fully customizable marketing automation platform that gives you complete control over your data and marketing infrastructure.

Key features include:

* **Multi-channel Marketing**: Manage email campaigns, SMS, web notifications, and social media from one platform
* **Campaign Builder**: Create complex automation workflows with an intuitive drag-and-drop interface
* **Lead Management**: Track contacts, score leads, and segment audiences based on behavior and attributes
* **Self-hosted & Privacy-focused**: Full data sovereignty with compliance-ready features for GDPR and other regulations
* **Unlimited & Customizable**: No restrictions on users, contacts, or campaigns - extend functionality through plugins
* **CRM Integration**: Native integrations with HubSpot, Salesforce, Zoho CRM, Microsoft Dynamics, and more
* **API-driven**: Comprehensive REST API for automation and custom integrations

## Links

* [Official Website](https://www.mautic.org/?utm_source=coolify.io)
* [Official Documentation](https://docs.mautic.org/?utm_source=coolify.io)
* [GitHub Repository](https://github.com/mautic/mautic?utm_source=coolify.io)

---

---
url: /docs/services/maybe.md
description: >-
  Manage finances with Maybe on Coolify for net worth tracking, investment
  portfolio, financial planning, and personal wealth management insights.
---

# Maybe

## What is Maybe

Maybe: The OS for your personal finances.

## Links

* [Official Documentation](https://github.com/maybe-finance/maybe?utm_source=coolify.io)

---

---
url: /docs/services/mealie.md
description: >-
  Deploy Mealie recipe manager on Coolify for meal planning, grocery lists,
  recipe organization, and household cooking management with nutrition.
---

# Mealie

## What is Mealie

A recipe manager and meal planner.

## Links

* [Official Documentation](https://docs.mealie.io/?utm_source=coolify.io)

---

---
url: /docs/services/mediawiki.md
description: >-
  Run MediaWiki on Coolify for Wikipedia-style documentation, knowledge bases,
  collaborative editing, and structured wiki content management.
---

![Mediawiki](https://www.mediawiki.org/static/images/icons/mediawikiwiki.svg)

## What is Mediawiki?

Free and open source collaborative space for managing and sharing knowledge.

## Installation Steps

1. Comment out the shared volume for LocalSettings in your configuration.
2. Start the container.
3. Go to `http(s)://your-domain` to access the MediaWiki installation wizard.
4. Configure MediaWiki according to your needs through the wizard.
5. Download the generated `LocalSettings.php` file.
6. Stop the container.
7. Move the downloaded `LocalSettings.php` file to the specified file mount path on your server.
8. Uncomment the shared volume configuration to mount the `LocalSettings.php` file to the specified file mount path on your server.
9. Restart the container.

## Links

* [The official website](https://www.mediawiki.org/wiki/MediaWiki)
* [GitHub](https://github.com/wikimedia/mediawiki)

---

---
url: /docs/services/meilisearch.md
description: >-
  Deploy Meilisearch on Coolify for lightning-fast typo-tolerant search engine
  with instant results, filters, and developer-friendly REST API.
---

![Meilisearch](https://github.com/meilisearch/meilisearch/raw/main/assets/meilisearch-logo-light.svg?sanitize=true#gh-light-mode-only)

## What is Meilisearch?

A lightning-fast search engine that fits effortlessly into your apps, websites, and workflow

Meilisearch helps you shape a delightful search experience in a snap, offering features that work out-of-the-box to speed up your workflow.

## Screenshot

![Meilisearch screenshot](https://github.com/meilisearch/meilisearch/raw/main/assets/demo-light.gif#gh-light-mode-only)

## âœ¨ Features

* **Search-as-you-type:** find search results in less than 50 milliseconds
* **[Typo tolerance](https://www.meilisearch.com/docs/learn/configuration/typo_tolerance?utm_campaign=oss\&utm_source=github\&utm_medium=meilisearch\&utm_content=features):** get relevant matches even when queries contain typos and misspellings
* **[Filtering](https://www.meilisearch.com/docs/learn/fine_tuning_results/filtering?utm_campaign=oss\&utm_source=github\&utm_medium=meilisearch\&utm_content=features) and [faceted search](https://www.meilisearch.com/docs/learn/fine_tuning_results/faceted_search?utm_campaign=oss\&utm_source=github\&utm_medium=meilisearch\&utm_content=features):** enhance your users' search experience with custom filters and build a faceted search interface in a few lines of code
* **[Sorting](https://www.meilisearch.com/docs/learn/fine_tuning_results/sorting?utm_campaign=oss\&utm_source=github\&utm_medium=meilisearch\&utm_content=features):** sort results based on price, date, or pretty much anything else your users need
* **[Synonym support](https://www.meilisearch.com/docs/learn/configuration/synonyms?utm_campaign=oss\&utm_source=github\&utm_medium=meilisearch\&utm_content=features):** configure synonyms to include more relevant content in your search results
* **[Geosearch](https://www.meilisearch.com/docs/learn/fine_tuning_results/geosearch?utm_campaign=oss\&utm_source=github\&utm_medium=meilisearch\&utm_content=features):** filter and sort documents based on geographic data
* **[Extensive language support](https://www.meilisearch.com/docs/learn/what_is_meilisearch/language?utm_campaign=oss\&utm_source=github\&utm_medium=meilisearch\&utm_content=features):** search datasets in any language, with optimized support for Chinese, Japanese, Hebrew, and languages using the Latin alphabet
* **[Security management](https://www.meilisearch.com/docs/learn/security/master_api_keys?utm_campaign=oss\&utm_source=github\&utm_medium=meilisearch\&utm_content=features):** control which users can access what data with API keys that allow fine-grained permissions handling
* **[Multi-Tenancy](https://www.meilisearch.com/docs/learn/security/tenant_tokens?utm_campaign=oss\&utm_source=github\&utm_medium=meilisearch\&utm_content=features):** personalize search results for any number of application tenants
* **Highly Customizable:** customize Meilisearch to your specific needs or use our out-of-the-box and hassle-free presets
* **[RESTful API](https://www.meilisearch.com/docs/reference/api/overview?utm_campaign=oss\&utm_source=github\&utm_medium=meilisearch\&utm_content=features):** integrate Meilisearch in your technical stack with our plugins and SDKs
* **Easy to install, deploy, and maintain**

## Links

* [The official website](https://www.meilisearch.com)
* [GitHub](https://github.com/meilisearch/meilisearch)

---

---
url: /docs/services/memos.md
description: >-
  Host Memos note-taking on Coolify for quick thoughts, lightweight journaling,
  tagging, and privacy-focused personal knowledge management.
---

## What is Memos?

An open-source, lightweight note-taking solution. The pain-less way to create your meaningful notes. Your Notes, Your Way.

## Screenshots

## Links

* [The official website](https://usememos.com/?utm_source=coolify.io)
* [GitHub](https://github.com/usememos/memos?utm_source=coolify.io)

---

---
url: /docs/services/metabase.md
description: >-
  Run Metabase analytics on Coolify for business intelligence, SQL querying,
  dashboards, and self-service data visualization without coding.
---

![Metabase](https://github.com/metabase/metabase/raw/master/docs/images/metabase-product-screenshot.png)

## What is Metabase?

Metabase is the easy, open-source way for everyone in your company to ask questions and learn from data.

## Features

* [Set up in five minutes](https://www.metabase.com/docs/latest/setting-up-metabase.html) (we're not kidding).
* Let anyone on your team [ask questions](https://www.metabase.com/docs/latest/users-guide/04-asking-questions.html) without knowing SQL.
* Use the [SQL editor](https://www.metabase.com/docs/latest/questions/native-editor/writing-sql) for more complex queries.
* Build handsome, interactive [dashboards](https://www.metabase.com/docs/latest/users-guide/07-dashboards.html) with filters, auto-refresh, fullscreen, and custom click behavior.
* Create [models](https://www.metabase.com/learn/getting-started/models) that clean up, annotate, and/or combine raw tables.
* Define canonical [segments and metrics](https://www.metabase.com/docs/latest/administration-guide/07-segments-and-metrics.html) for your team to use.
* Send data to Slack or email on a schedule with [dashboard subscriptions](https://www.metabase.com/docs/latest/users-guide/dashboard-subscriptions).
* Set up [alerts](https://www.metabase.com/docs/latest/users-guide/15-alerts.html) to have Metabase notify you when your data changes.
* [Embed charts and dashboards](https://www.metabase.com/docs/latest/administration-guide/13-embedding.html) in your app, or even [your entire Metabase](https://www.metabase.com/docs/latest/enterprise-guide/full-app-embedding.html).

## Links

* [The official website](https://www.metabase.com/)
* [Github](https://github.com/metabase/metabase)

---

---
url: /docs/services/metamcp.md
description: Here you can find the documentation for hosting MetaMCP with Coolify.
---

## What is MetaMCP?

MetaMCP is an MCP aggregator/orchestrator that lets you group multiple MCP servers into namespaces, apply middleware, and expose a single unified endpoint. It supports SSE and Streamable HTTP transports (plus OpenAPI), works with popular MCP clients, and is built to simplify composing tools and hosting them behind API key or OAuth-based access.

## Links

* Official documentation â€º [https://docs.metamcp.com](https://docs.metamcp.com?utm_source=coolify.io)
* GitHub â€º [https://github.com/metatool-ai/metamcp](https://github.com/metatool-ai/metamcp?utm_source=coolify.io)

---

---
url: /docs/services/metube.md
description: >-
  Deploy MeTube on Coolify for YouTube video downloading with web interface
  supporting playlists, quality selection, and multiple video platforms.
---

![Metube](https://github.com/alexta69/metube/raw/master/screenshot.gif)

## What is Metube?

Web GUI for youtube-dl (using the yt-dlp fork) with playlist support. Allows you to download videos from YouTube and dozens of other sites.

## Links

* [GitHub](https://github.com/alexta69/metube)

---

---
url: /docs/knowledge-base/how-to/migrate-apps-different-host.md
description: >-
  Step-by-step guide to migrate applications, databases, and Docker volumes from
  one Coolify server to another with backup and restore scripts
---

# Migrate Applications to Another Coolify Host

Coolify does not have a built-in option to migrate applications from one server to another.

You have to manually deploy your app on the new server and copy over your databases and volumes. This guide walks you through that process step by step.

::: info Note
We assume you already have Coolify installed on your destination server and are ready to migrate your app.
:::

## 1. Understand Data Persistence

When using Coolify, application data lives in one of two places:

### Bind mounts

* When using bind mounts, a host directory or file is mapped into the container.
* Any changes made to the directory or file on the host will immediately reflect inside the container.
* To back up data, simply copy the host directory or file to the new server and update the bind-mount path in your applicationâ€™s configuration.

### Volume mounts

* With volume mounts, a Docker volume is created (Coolify usually creates the volume, but you can also set it up yourself.) and used to store application data.
* The volume is stored in Dockerâ€™s volume directory, typically under `/var/lib/docker/volumes/<VOLUME_NAME>`
* You canâ€™t just copy that directory directly, instead Docker provides a safe backup-and-restore method using a temporary container.

::: info Note
Since bind mounts are simple to migrate by copying files directly, this guide will focus primarily on volume backups.
:::

## 2. Backup and Restore Overview

The [Docker-recommended process](https://docs.docker.com/engine/storage/volumes/#back-up-restore-or-migrate-data-volumes) for volume migration looks like this:

1. **Mount** your volume into a temporary container.
2. **Archive** the volumeâ€™s contents into a tarball.
3. **Copy** the tarball from the container to your host and then delete the temporary container.
4. **Transfer** the tarball to the new server.
5. **Create** a fresh volume on the destination.
6. **Mount** the transferred tarball into a temporary container.
7. **Extract** the archive into the new volume.

This series of steps ensures a consistent, safe backup and restore. Below, weâ€™ll provide ready-to-use scripts and detailed instructions.

***

::: info Note
The steps below include scripts to help you back up, transfer, and restore volumes easily and interactively.

They also include checks to ensure volumes and backups exist, to prevent mistakes like restoring to the wrong volume.
:::

## 3. Backup the Volume

1. **SSH into your server** where you have the Docker volume.

2. **Create a script** named `backup.sh`:
   ```sh
   touch backup.sh && chmod +x backup.sh
   ```

3. **Open** `backup.sh` in your editor and paste the following:

   ```sh title="backup.sh"
   #!/bin/bash

   # === INPUT PROMPTS ===
   # Prompt for the Docker volume name and set the variable
   read -p "[ Backup Agent ] [ INPUT ] Please enter the Docker volume name to back up: " VOLUME_NAME

   # Inform the user of the set volume name
   echo "[ Backup Agent ] [ INFO ] Backup Volume is set to $VOLUME_NAME"

   # Check if the entered volume exists
   if ! docker volume ls --quiet | grep -q "^$VOLUME_NAME$"; then
       echo "[ Backup Agent ] [ ERROR ] Volume '$VOLUME_NAME' doesn't exist, aborting backup."
       echo "[ Backup Agent ] [ ERROR ] Backup Failed!"
       exit 1  # Exit if volume doesn't exist
   else
       echo "[ Backup Agent ] [ INFO ] Volume '$VOLUME_NAME' exists, continuing backup..."
   fi

   # Prompt for the directory to save the backup
   read -p "[ Backup Agent ] [ INPUT ] Please enter the directory to save the backup (Optional: press enter to use ./volume-backup): " BACKUP_DIR
   # If no directory is entered, default to './volume-backup'
   BACKUP_DIR=${BACKUP_DIR:-./volume-backup}

   # Inform the user of the backup location
   echo "[ Backup Agent ] [ INFO ] Backup location is set to $BACKUP_DIR"

   # Set the backup file name based on the volume name
   BACKUP_FILE="${VOLUME_NAME}-backup.tar.gz"

   # Inform the user of the backup file name
   echo "[ Backup Agent ] [ INFO ] Backup file name is set to $BACKUP_FILE"

   # === SCRIPT START ===
   # Check if the backup directory exists
   if [ -d "$BACKUP_DIR" ]; then
       echo "[ Backup Agent ] [ INFO ] Directory '$BACKUP_DIR' already exists, skipping directory creation."
   else
       echo "[ Backup Agent ] [ INFO ] Directory '$BACKUP_DIR' does not exist, creating directory."
       # Create the backup directory, exit if creation fails
       mkdir -p "$BACKUP_DIR" || { 
           echo "[ Backup Agent ] [ ERROR ] Failed to create directory '$BACKUP_DIR', aborting backup."
           echo "[ Backup Agent ] [ ERROR ] Backup Failed!"
           exit 1
       }
   fi

   # Perform the backup operation
   echo "[ Backup Agent ] [ INFO ] Backing up volume: $VOLUME_NAME to $BACKUP_DIR/$BACKUP_FILE"

   # Run the Docker container to create the backup
   docker run --rm \
     -v "$VOLUME_NAME":/volume \
     -v "$(pwd)/$BACKUP_DIR":/backup \
     busybox \
     tar czf /backup/"$BACKUP_FILE" -C /volume . || { 
       # If the backup fails, print an error message and exit
       echo "[ Backup Agent ] [ ERROR ] Backup process failed, aborting."
       echo "[ Backup Agent ] [ ERROR ] Backup Failed!"
       exit 1
   }

   # If everything succeeds, notify the user
   echo "[ Backup Agent ] [ SUCCESS ] Backup completed!"
   ```

4. **Find the volume name** by running:

   ```sh
   docker volume ls
   ```

   Or from Coolifyâ€™s **Persistent Storage** page (see below).

5. **Stop your application** to perform a clean backup.

6. **Run** the script:

   ```sh
   ./backup.sh
   ```

   * When prompted, paste the volume name.
   * Press **Enter** to accept the default backup directory (`./volume-backup`), or type a custom path.

7. **Verify** that you now have a directory (e.g., `volume-backup`) containing `<VOLUME_NAME>-backup.tar.gz`.

***

## 4. Transfer the Backup to the New Server

::: success Tip
If you already know how to manually transfer the backup file, feel free to move on to the next step.
:::

1. **Create** a second script named `transfer.sh`:
   ```sh
   touch transfer.sh && chmod +x transfer.sh
   ```

2. **Open** `transfer.sh` in your editor and paste the following:

   ```sh title="transfer.sh"
   #!/bin/bash

   # =============== CONFIG VARIABLES ===============
   SSH_PORT=22
   SSH_USER="root"
   SSH_IP="192.168.1.222"
   SSH_KEY="$HOME/.ssh/local-vm"
   SOURCE_PATH="./volume-backup"
   DESTINATION_PATH="/root/backups/volume-backup"
   MAX_RETRIES=3  # Max number of password attempts

   echo "[ Transfer Agent ] [ INFO ] Starting transfer..."
   echo "[ Transfer Agent ] [ INFO ] Trying SSH key: $SSH_KEY"
   echo "[ Transfer Agent ] [ INFO ] Transfer from: $SOURCE_PATH"
   echo "[ Transfer Agent ] [ INFO ] Transfer to: $SSH_USER@$SSH_IP:$DESTINATION_PATH"

   # If SSH key file doesnâ€™t exist, fall back to password mode
   if [ ! -f "$SSH_KEY" ]; then
     echo "[ Transfer Agent ] [ WARN ] SSH key '$SSH_KEY' not found. Falling back to password authentication."
     SSH_KEY=""
   fi

   # If we need password-based auth, ensure Expect is installed
   if [ -z "$SSH_KEY" ] && ! command -v expect >/dev/null 2>&1; then
     echo "[ Transfer Agent ] [ ERROR ] The package expect is required for password authentication but not installed (Install it manually using sudo apt install expect and try again). Aborting."
     exit 1
   fi

   # ---------------------------------------------
   # Helper: test whether $1 (the password) is valid by doing â€œssh â€¦ exitâ€
   # Returns 0 if OK, 1 if â€œPermission deniedâ€ (or any other failure)
   test_password_with_expect() {
     local PW="$1"

     expect -c "
       log_user 0
       set timeout 15
       spawn ssh -o StrictHostKeyChecking=no -p $SSH_PORT $SSH_USER@$SSH_IP exit
       expect {
         \"*?assword:\" {
           send -- \"$PW\r\"
           expect {
             \"Permission denied\" { exit 1 }
             eof { exit [lindex [wait] 3] }
           }
         }
         eof {
           exit [lindex [wait] 3]
         }
       }
     " >/dev/null 2>&1

     return $?
   }

   # Prompt up to $MAX_RETRIES times for a correct password
   get_password() {
     local retries=0
     while [ $retries -lt $MAX_RETRIES ]; do
       read -s -p "[ Transfer Agent ] [ INPUT ] Please enter the SSH password for $SSH_USER@$SSH_IP: " SSHPASS
       echo ""
       test_password_with_expect "$SSHPASS"
       if [ $? -eq 0 ]; then
         # Password is correct
         return 0
       else
         echo "[ Transfer Agent ] [ ERROR ] Invalid password. Please try again."
         retries=$((retries + 1))
       fi
     done

     echo "[ Transfer Agent ] [ ERROR ] Maximum retries reached. Aborting."
     exit 1
   }

   # ---------------------------------------------
   # STEP 0: Attempt SSH-key authentication (if a key is set)
   if [ -n "$SSH_KEY" ]; then
     # Use BatchMode to prevent falling back to password prompt
     ssh -i "$SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=no -p "$SSH_PORT" \
       "$SSH_USER@$SSH_IP" exit >/dev/null 2>&1
     RC=$?
     if [ $RC -eq 0 ]; then
       echo "[ Transfer Agent ] [ INFO ] SSH key is valid!"
       USING_KEY=true
     else
       echo "[ Transfer Agent ] [ WARN ] SSH key authentication failed. Falling back to password authentication."
       SSH_KEY=""
       USING_KEY=false
     fi
   else
     USING_KEY=false
   fi

   # If key auth failed (or no key), prompt for password
   if [ "$USING_KEY" = false ]; then
     get_password
     echo "[ Transfer Agent ] [ INFO ] Password is valid!"
   fi

   # ---------------------------------------------
   # STEP 1: Ensure the full DESTINATION_PATH exists on the remote side.
   echo "[ Transfer Agent ] [ INFO ] Ensuring remote directory '$DESTINATION_PATH' exists..."
   if [ -n "$SSH_KEY" ]; then
     ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -p "$SSH_PORT" \
       "$SSH_USER@$SSH_IP" "mkdir -p $DESTINATION_PATH" >/dev/null 2>&1
     MKRC=$?
   else
     expect -c "
       log_user 0
       set timeout 5
       spawn ssh -o StrictHostKeyChecking=no -p $SSH_PORT $SSH_USER@$SSH_IP mkdir -p $DESTINATION_PATH
       expect {
         \"*?assword:\" {
           send -- \"$SSHPASS\r\"
           exp_continue
         }
         eof {
           exit [lindex [wait] 3]
         }
       }
     " >/dev/null 2>&1
     MKRC=$?
   fi

   if [ $MKRC -ne 0 ]; then
     echo "[ Transfer Agent ] [ ERROR ] Failed to create remote directory. Aborting."
     exit 1
   fi

   # ---------------------------------------------
   # STEP 2: Copy only the contents of local â€œvolume-backupâ€ into that folder.
   echo "[ Transfer Agent ] [ INFO ] Initiating file transfer..."

   # Capture any SCP stderr in a temp file so we can surface it if something goes wrong
   SCP_LOG="$(mktemp)"
   if [ -n "$SSH_KEY" ]; then
     # Suppress stdout, capture only stderr
     scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -P "$SSH_PORT" -r \
         "$SOURCE_PATH"/. "$SSH_USER@$SSH_IP:$DESTINATION_PATH" > /dev/null 2> "$SCP_LOG"
     SCP_RC=$?
   else
     expect -c "
       log_user 0
       set timeout -1
       spawn scp -o StrictHostKeyChecking=no -P $SSH_PORT -r $SOURCE_PATH/. $SSH_USER@$SSH_IP:$DESTINATION_PATH
       expect {
         \"*?assword:\" {
           send -- \"$SSHPASS\r\"
           exp_continue
         }
         eof {
           exit [lindex [wait] 3]
         }
       }
     " 2> "$SCP_LOG"
     SCP_RC=$?
   fi

   if [ $SCP_RC -eq 0 ]; then
     echo "[ Transfer Agent ] [ SUCCESS ] Transfer completed."
     rm -f "$SCP_LOG"
     exit 0
   else
     echo "[ Transfer Agent ] [ ERROR ] Transfer failed."
     while IFS= read -r line; do
       echo "[ Transfer Agent ]    $line"
     done < "$SCP_LOG"
     rm -f "$SCP_LOG"
     exit 1
   fi
   ```

3. **Adjust** the variables at the top (`SSH_IP`, `SSH_USER`, `SSH_KEY`, `DESTINATION_PATH`) to match your new server.

4. **Run** the transfer:

   ```sh
   ./transfer.sh
   ```

   * If key-based authentication succeeds, the backup folder copies over via SCP.
   * Otherwise, youâ€™ll be prompted for the SSH password.

***

## 5. Restore the Backup on the New Server

::: info Note
In this example, weâ€™ll use [Umami Analytics](https://umami.is/?utm_source=coolify.io) (PostgreSQL) to show how you restore a database-backed app. Adjust paths and volume names for your own database.
:::

1. **Deploy your application** on the new server with Coolify, then **stop it** so volumes will be created but won't be in use.

2. **SSH into** the new server and **create** a script called `restore.sh`:

   ```sh
   touch restore.sh && chmod +x restore.sh
   ```

3. **Paste** the following into `restore.sh`:
   ```sh title="restore.sh"
   #!/bin/bash

   # === VOLUME NAME INPUT ===
   # Prompt for the target Docker volume name to restore into
   read -p "[ Restore Agent ] [ INPUT ] Enter the target Docker volume name to restore into: " TARGET_VOLUME

   # === VOLUME CHECK ===
   # Check if the target volume exists
   if ! docker volume ls --quiet | grep -q "^$TARGET_VOLUME$"; then
     echo "[ Restore Agent ] [ ERROR ] Volume '$TARGET_VOLUME' doesn't exist."

     # Ask if the user wants to create the volume
     read -p "[ Restore Agent ] [ INPUT ] Do you want to create a new volume with the name '$TARGET_VOLUME'? (y/N): " create_volume
     if [[ "$create_volume" == "y" ]]; then
       echo "[ Restore Agent ] [ INFO ] Creating volume '$TARGET_VOLUME'..."
       docker volume create "$TARGET_VOLUME" || { 
         echo "[ Restore Agent ] [ ERROR ] Failed to create volume '$TARGET_VOLUME', aborting restore."
         echo "[ Restore Agent ] [ ERROR ] Restore Failed!"
         exit 1
       }
       echo "[ Restore Agent ] [ INFO ] Volume '$TARGET_VOLUME' created successfully."
     else
       echo "[ Restore Agent ] [ INFO ] Volume '$TARGET_VOLUME' doesn't exist and user opted not to create it. Aborting restore."
       echo "[ Restore Agent ] [ ERROR ] Restore Failed!"
       exit 1
     fi
   else
     echo "[ Restore Agent ] [ INFO ] Volume '$TARGET_VOLUME' exists, continuing..."
   fi

   # === BACKUP DIRECTORY INPUT ===
   # Prompt for the backup directory (default: ./volume-backup)
   read -p "[ Restore Agent ] [ INPUT ] Enter the backup directory (default: ./volume-backup): " BACKUP_DIR
   BACKUP_DIR=${BACKUP_DIR:-./volume-backup}

   # === BACKUP DIRECTORY CHECK ===
   # Check if the backup directory exists
   if [[ ! -d "$BACKUP_DIR" ]]; then
     echo "[ Restore Agent ] [ ERROR ] Backup directory not found: $BACKUP_DIR"
     echo "[ Restore Agent ] [ ERROR ] Restore Failed!"
     exit 1
   fi
   echo "[ Restore Agent ] [ INFO ] Backup directory '$BACKUP_DIR' found, continuing..."

   # === BACKUP FILE INPUT ===
   # Prompt for the backup file name
   read -p "[ Restore Agent ] [ INPUT ] Enter the backup file name (e.g., abc123_postgresql.tar.gz): " BACKUP_FILE

   # === BACKUP FILE CHECK ===
   # Check if the backup file exists
   if [[ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]]; then
     echo "[ Restore Agent ] [ ERROR ] Backup file not found: $BACKUP_DIR/$BACKUP_FILE"
     echo "[ Restore Agent ] [ ERROR ] Restore Failed!"
     exit 1
   fi
   echo "[ Restore Agent ] [ INFO ] Backup file '$BACKUP_FILE' found, continuing..."

   # === SAFETY CONFIRMATION ===
   echo "[ Restore Agent ] [ INFO ] Make sure containers using '$TARGET_VOLUME' are stopped!"
   read -p "[ Restore Agent ] [ INPUT ] Proceed with restore? (y/N): " confirm
   if [[ "$confirm" != "y" ]]; then
     echo "[ Restore Agent ] [ ERROR ] Restore Failed: cancelled by user."
     exit 1
   fi

   # === RESTORE START ===
   # Inform the user that restore is starting
   echo "[ Restore Agent ] [ INFO ] Restoring $BACKUP_FILE into volume: $TARGET_VOLUME"

   # Run the Docker container to restore the backup
   docker run --rm \
     -v "$TARGET_VOLUME":/volume \
     -v "$(pwd)/$BACKUP_DIR":/backup \
     busybox \
     sh -c "cd /volume && tar xzf /backup/$BACKUP_FILE" || { 
       # If the restore process fails, print an error message and exit
       echo "[ Restore Agent ] [ ERROR ] Docker restore process failed, aborting."
       echo "[ Restore Agent ] [ ERROR ] Restore Failed!"
       exit 1
   }

   # If everything succeeds, notify the user
   echo "[ Restore Agent ] [ SUCCESS ] Restore completed!"
   ```

4. **Run** the script:

   ```sh
   ./restore.sh
   ```

   * Enter the **volume name** (from `docker volume ls` command or Coolify's Persistent Storage page).
   * Press **Enter** to accept `./volume-backup`, or type a custom backup path.
   * Enter the backup filename (e.g., `umami_postgresql-backup.tar.gz`).
   * Confirm you want to proceed by typing `y`.

***

## 6. Start Your Application

Once the restore finishes, go to Coolifyâ€™s dashboard and click **Deploy**.

Your application should now use the migrated data. If it does not, or if logs show errors then repeat the restore step to ensure all files copied correctly.

::: warning Note
If the database credentials (username, database name or password) are different on the new server, update them in Coolifyâ€™s dashboard to match those from the old server.

---

---
url: /docs/services/mindsdb.md
description: >-
  Host MindsDB on Coolify for AI-powered database with ML predictions, AutoML,
  model deployment, and SQL-based machine learning integration.
---

# Mindsdb

## What is Mindsdb

MindsDB is the platform for building AI from enterprise data, enabling smarter organizations.

## Links

* [Official Documentation](https://docs.mindsdb.com/what-is-mindsdb?utm_source=coolify.io)

---

---
url: /docs/services/minecraft.md
description: >-
  Run Minecraft server on Coolify for multiplayer gaming, custom worlds, mods
  support, and community gameplay with dedicated server hosting.
---

# What is Minecraft?

Minecraft is a sandbox video game developed by Mojang Studios. The game was created by Markus "Notch" Persson in the Java programming language.

It is a single-player and multiplayer game that allows players to explore, build, and mine in a procedurally generated world.

## Links

* [GitHub](https://github.com/itzg/docker-minecraft-server)

---

---
url: /docs/services/miniflux.md
description: >-
  Deploy Miniflux RSS reader on Coolify for minimalist feed aggregation,
  reading, filtering, and distraction-free news consumption with speed.
---

# Miniflux

## What is Miniflux?

Miniflux is a minimalist and opinionated feed reader that focuses on simplicity and performance. It supports RSS, Atom, and JSON feeds with features like full-text search, keyboard shortcuts, mobile-responsive design, and integration with read-it-later services. Miniflux is designed to be fast, lightweight, and distraction-free, making it perfect for users who want a clean RSS reading experience.

## Links

* [The official website](https://miniflux.app?utm_source=coolify.io)
* [GitHub](https://github.com/miniflux/v2?utm_source=coolify.io)

---

---
url: /docs/services/minio.md
description: >-
  Host MinIO object storage on Coolify as S3-compatible high-performance storage
  for backups, data lakes, and cloud-native application storage.
---

# MinIO Community Edition

![MinIO](/images/services/minio-logo.svg)

## What is MinIO?

MinIO is a high-performance, distributed object storage system compatible with Amazon S3 APIs. It is software-defined, runs on industry-standard hardware, and is 100% open source under the AGPL v3.0 license. MinIO delivers high-performance, Kubernetes-native object storage that is designed for large scale AI/ML, data lake and database workloads.

## Links

* [The official website](https://min.io?utm_source=coolify.io)
* [Documentation](https://min.io/docs/minio/linux/index.html?utm_source=coolify.io)
* [GitHub](https://github.com/minio/minio?utm_source=coolify.io)
* [Community Edition Info](https://github.com/coollabsio/minio?utm_source=coolify.io)

## FAQ

### Invalid login credentials

You need to run MinIO on `https` (not self-signed) to avoid this issue. MinIO doesn't support http based authentication.

---

---
url: /docs/services/mixpost.md
description: >-
  Run Mixpost social media on Coolify for scheduling, analytics, content
  calendar, and multi-platform social media management self-hosted solution.
---

![Mixpost](https://raw.githubusercontent.com/inovector/mixpost/main/art/logo.svg)

## What is Mixpost?

Self-hosted social media management software (Buffer alternative).

## Links

* [The official Mixpost website](https://mixpost.app/)
* [GitHub](https://github.com/inovector/mixpost)

---

---
url: /docs/databases/mongodb.md
description: >-
  Deploy MongoDB NoSQL databases on Coolify with flexible document storage,
  horizontal scalability, and automated backup solutions.
---

# MongoDB

![MongoDB](/images/database-logos/mongodb.webp)

## What is MongoDB

MongoDB is a popular, open-source document-oriented NoSQL database designed for scalability and flexibility. It stores data in flexible, JSON-like documents, meaning fields can vary from document to document and data structure can be changed over time.

MongoDB is known for its horizontal scalability, powerful query language, and ability to handle large volumes of unstructured or semi-structured data. It's widely used in modern web applications, content management systems, and other scenarios where flexible data models and scalability are crucial.

## Links

* [The official website](https://www.mongodb.com/)
* [GitHub](https://github.com/mongodb/mongo)

---

---
url: /docs/knowledge-base/monitoring.md
description: >-
  Monitor Coolify resources with built-in disk usage tracking, automatic
  cleanup, container status monitoring, and backup status notifications.
---

# Monitoring

Coolify has a built-in monitoring system, which can be used to monitor your resources and send notifications to your team if something goes wrong.

Currently Coolify monitors the following resources:

* Disk usage - If your disk usage is above the configured threshold, it does an automatic cleanup.
* If any of your containers are stopped or restarted.
* Backup status.

---

---
url: /docs/services/moodle.md
description: >-
  Deploy Moodle LMS on Coolify for online learning, course management,
  assignments, quizzes, and educational platform with extensive plugins.
---

![Moodle](https://raw.githubusercontent.com/moodle/moodle/main/.github/moodlelogo.svg)

## What is Moodle?

Moodle is an open-source learning platform that provides a secure and private alternative to popular cloud storage services like Google Drive and Dropbox. It allows you to store, sync, and share files, photos, and videos across multiple devices, and offers features like file versioning, password-protected sharing, and collaboration tools.

## Links

* [The official website](https://moodle.com/)
* [GitHub](https://github.com/moodle/moodle)

---

---
url: /docs/services/mosquitto.md
description: >-
  Host Eclipse Mosquitto on Coolify for MQTT message broker supporting IoT
  device communication, pub/sub messaging, and lightweight protocols.
---

![Mosquitto](https://raw.githubusercontent.com/eclipse-mosquitto/mosquitto/refs/heads/master/logo/mosquitto-text-below.svg)

## What is Mosquitto?

Mosquitto is an open-source MQTT (Message Queuing Telemetry Transport) broker that facilitates communication between IoT devices by implementing the lightweight MQTT protocol. It's designed to provide reliable message delivery in scenarios with limited bandwidth or unstable networks, making it a key component for IoT and home automation systems.

## Links

* [The official website](https://mosquitto.org/)
* [GitHub](https://github.com/eclipse/mosquitto)

---

---
url: /docs/applications/ci-cd/github/move-between-github-apps.md
description: >-
  Migrate Coolify repositories between GitHub Apps when moving to new
  organizations with Git source updates and repository reconfiguration.
---

# Move Between GitHub Apps

This guide will show you how to move repositories between GitHub Apps.

## Prerequisites

* Coolify v4.0.0-beta.408 or higher

## Problem

You have an already configured repository in Coolify, but you want to move it to another GitHub App.

For example, you moved your repositories to a new organization and want to use a new/existing GitHub App for that organization.

## Solution

1. Move the repositories to your new GitHub organization (or to your personal account).
2. Add the new GitHub App to Coolify, either by creating [manually](/applications/ci-cd/github/manually-setup-github-app) or automatically through Coolify's UI.
3. Make sure the Github App installation has access to the repositories on the new place, for example by opening `https://github.com/organizations/<organization>/settings/installations` and check the added repositories.
4. Go to your application in Coolify -> `Git Source` tab and select the new Github App.
5. Make sure you change the repository name to the new one, like from `andrasbacsai/test-repo` to `coollabsio/test-repo`.
6. Redeploy.

---

---
url: /docs/knowledge-base/server/multiple-servers.md
description: >-
  Deploy applications across multiple servers with Coolify for high availability
  using Docker Registry, load balancers, and synchronized deployments.
---

# Multiple Servers

With this feature, You could deploy the same application to multiple servers, add a load balancer in front of them and you will get a highly available application.

::: danger CAUTION
**This is an experimental feature.**
:::

## Requirements

* Each server should be added to Coolify, validated and reachable.
* Each server (and the optional build server) should be the same architecture (AMD64, ARM).
* You must push the built image to a Docker Registry. Coolify automates the process, you just need to [login to the registry](/knowledge-base/docker/registry#docker-credentials) on the server.

## How to use?

When you configure (or already configured) an application, you selected a server / network where it deploys. This will be your main server.

Any additional servers must be set in the `Servers` menu, simply by clicking on it.

Now everytime you redeploy, restart or stop the application, the action will be done on all servers.

If the deploy needs a build process, it will be executed on the main server (or on the build server if you have one). The deploy process will upload the built image to the Docker Registry and only after all other servers will be notified to pull and deploy this image.

## How to configure a loadbalancer?

At the moment, it is not automated. So you have to manually setup a loadbalancer. There are two ways to use.

### Port mapping to host

If you set `Ports Mappings` for your application, so one port from the docker container will mapped to a port on the host server, all you need to do is to:

1. Set all the `IP:PORT` as a destination in your loadbalancer.
2. Remove any domains from the `Domains` field in Coolify.

In this case, Coolify Proxy is not used as you can reach the application with IP:PORT

::: success Tip
This is super simple and effective. But keep in mind, that you need to only allow incoming connections to the selected `PORT` from the loadbalancer, otherwise everyone can reach your application directly, without the loadbalancer.
:::

### Using a domain

In this case, you need to set the **loadbalancer domain with HTTP, (not HTTPS)** in the `Domains` field, and then set the proper configuration for your loadbalancer, with SSL termination.

With this configuration, you can use several domains with one loadbalancer.

---

---
url: /docs/databases/mysql.md
description: >-
  Deploy MySQL databases on Coolify with ACID compliance, replication,
  partitioning, full-text indexing, and automated backup features.
---

# MySQL

![MySQL](/images/database-logos/mysql.webp)

## What is MySQL

MySQL is a widely-used, open-source relational database management system (RDBMS) known for its reliability, ease of use, and performance. It's an essential component of the popular LAMP (Linux, Apache, MySQL, PHP/Python/Perl) stack used for web development.

MySQL provides a robust, ACID-compliant database solution suitable for a wide range of applications, from small websites to large-scale enterprise systems. It offers features like replication, partitioning, and full-text indexing, making it versatile for various use cases.

## Links

* [The official website](https://www.mysql.com/)
* [GitHub](https://github.com/mysql/mysql-server)

---

---
url: /docs/services/n8n.md
description: >-
  Build workflows on Coolify with n8n automation platform connecting 400+ apps,
  APIs, databases for no-code/low-code task automation and integration.
---

![N8N](https://user-images.githubusercontent.com/65276001/173571060-9f2f6d7b-bac0-43b6-bdb2-001da9694058.png)

## What is N8N?

N8N is an open-source workflow automation tool that allows you to connect different applications and services together. It is an open-source alternative to tools like Zapier or Make.

## Deployment Variants

N8N is available in three deployment configurations in Coolify:

### n8n (Default)

* **Database:** SQLite (embedded)
* **Use case:** Simple deployments, testing, or low-volume workflows
* **Components:** Single n8n container with built-in SQLite database

### n8n with PostgreSQL

* **Database:** PostgreSQL (external)
* **Use case:** Production deployments requiring better performance, scalability, and data persistence
* **Components:**
  * n8n container
  * PostgreSQL 16 container
  * Automatic database configuration and health checks

### n8n with PostgreSQL and Worker

* **Database:** PostgreSQL + Redis
* **Use case:** High-volume production deployments with queue-based execution and parallel workflow processing
* **Components:**
  * n8n main container
  * n8n-worker container for distributed execution
  * PostgreSQL 16 container
  * Redis container for queue management
  * Automatic database configuration and health checks

## Screenshots

![N8N Preview](https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-screenshot.png)

### Extending n8n with custom dependencies

To extend n8n with custom dependencies, you can add them following the example below to your Dockerfile:

```dockerfile
...
RUN apk add --no-cache ffmpeg
...
```

### Example Dockerfile

```dockerfile
FROM n8nio/n8n:latest

# Switch to root user to install packages and modify system directories
USER root

# Install necessary system packages using apk
# build-base, python3-dev, geoip-dev are needed for potential native dependencies
# wget for downloading, git for source control (might be needed by Go), bash (useful shell)
RUN apk update && \
    apk add --no-cache \
        wget \
        ffmpeg


ENV N8N_HOST=${SUBDOMAIN}.${DOMAIN_NAME}
ENV N8N_PORT=5678
ENV N8N_PROTOCOL=https
ENV NODE_ENV=production
ENV WEBHOOK_URL=https://${SUBDOMAIN}.${DOMAIN_NAME}/

# Switch back to the non-root user that n8n runs as (typically 'node')
USER node
```

## Links

* [The official website](https://n8n.io/)
* [GitHub](https://github.com/n8n-io/n8n)

---

---
url: /docs/services/navidrome.md
description: >-
  Stream music on Coolify with Navidrome personal server supporting Subsonic
  API, web player, mobile apps, and self-hosted music library.
---

## What is Navidrome?

Navidrome is an open source web-based music collection server and streamer. It gives you freedom to listen to your music collection from any browser or mobile device.

## Screenshots

## Links

* [The official website](https://www.navidrome.org/?utm_source=coolify.io)
* [GitHub](https://github.com/navidrome/navidrome/?utm_source=coolify.io)

---

---
url: /docs/services/neon-ws-proxy.md
description: >-
  Deploy Neon WebSocket proxy on Coolify for serverless Postgres connections,
  connection pooling, and edge database access optimization.
---

# Neon Ws Proxy

## What is Neon Ws Proxy

The database you love, on a serverless platform designed to help you build reliable and scalable applications faster.

## Links

* [Official Documentation](https://neon.tech?utm_source=coolify.io)

---

---
url: /docs/services/netbird-client.md
description: >-
  Run NetBird client on Coolify for WireGuard-based mesh VPN, zero-trust network
  access, and secure peer-to-peer connectivity.
---

## What is Netbird-Client?

Connect your devices into a secure WireGuardÂ®-based overlay network with SSO, MFA and granular access controls.

## Links

* [The official website](https://netbird.io/?utm_source=coolify.io)
* [GitHub](https://github.com/netbirdio/netbird?utm_source=coolify.io)

---

---
url: /docs/services/newapi.md
description: >-
  The next-generation LLM gateway and AI asset management system supports
  multiple languages.
---

# NewAPI

## What is NewAPI?

The next-generation LLM gateway and AI asset management system supports multiple languages.

## Links

* [Official website](https://docs.newapi.pro/en/getting-started?utm_source=coolify.io)
* [GitHub](https://github.com/QuantumNous/new-api?utm_source=coolify.io)

---

---
url: /docs/services/newt-pangolin.md
description: >-
  Deploy Newt Pangolin on Coolify for secure WireGuard tunneling, reverse proxy,
  and zero-trust network access to your services from anywhere.
---

## What is Newt Pangolin?

Pangolin tunnels your services to the internet so you can access anything from anywhere. It provides secure, encrypted connections using WireGuard, offering zero-trust network access and reverse proxy capabilities for your self-hosted services.

## Links

* [Official Documentation](https://docs.digpangolin.com/manage/sites/install-site?utm_source=coolify.io)

---

---
url: /docs/services/next-image-transformation.md
description: >-
  Host Next.js image optimizer on Coolify for dynamic image resizing, format
  conversion, CDN caching, and web performance optimization.
---

# Next Image Transformation

## What is Next Image Transformation

Drop-in replacement for Vercel's Nextjs image optimization service.

## Links

* [Official Documentation](https://github.com/coollabsio/next-image-transformation?utm_source=coolify.io)

---

---
url: /docs/services/nextcloud.md
description: >-
  Deploy Nextcloud on Coolify for self-hosted cloud storage, file sync,
  calendar, contacts, office collaboration, and Google Drive alternative.
---

![NextCloud](https://nextcloud.com/c/uploads/2022/11/logo_nextcloud_white.svg)

## What is NextCloud?

NextCloud is an open-source productivity platform that provides a secure and private alternative to popular cloud storage services like Google Drive and Dropbox. It allows you to store, sync, and share files, photos, and videos across multiple devices, and offers features like file versioning, password-protected sharing, and collaboration tools.

## Deployment Variants

Nextcloud is available in four deployment configurations in Coolify:

### Nextcloud (Default)

* **Database:** SQLite (embedded)
* **Use case:** Simple deployments, testing, or personal file storage
* **Components:** Single Nextcloud container with built-in SQLite database

### Nextcloud with PostgreSQL

* **Database:** PostgreSQL
* **Use case:** Production deployments requiring better performance and scalability
* **Components:**
  * Nextcloud container
  * PostgreSQL container
  * Automatic database configuration and health checks

### Nextcloud with MySQL

* **Database:** MySQL
* **Use case:** Production deployments with MySQL preference
* **Components:**
  * Nextcloud container
  * MySQL container
  * Automatic database configuration and health checks

### Nextcloud with MariaDB

* **Database:** MariaDB
* **Use case:** Production deployments with MariaDB preference (recommended for most users)
* **Components:**
  * Nextcloud container
  * MariaDB container
  * Automatic database configuration and health checks

## Screenshots

![NextCloud preview](https://raw.githubusercontent.com/nextcloud/screenshots/master/nextcloud-hub-files-25-preview.png)

## Links

* [The official website](https://nextcloud.com/)
* [GitHub](https://github.com/nextcloud/server)

---

---
url: /docs/applications/nextjs.md
description: >-
  Deploy Next.js applications on Coolify with server-side rendering, static
  builds, Nixpacks, or custom Dockerfile configurations.
---

# NextJS

NextJS is a React framework that enables functionality such as server-side rendering and generating static websites.

[Example repository.](https://github.com/coollabsio/coolify-examples/tree/main/nextjs)

## Deploy with Nixpacks

### Server build (NodeJS)

* Set `Build Pack` to `nixpacks`.

### Static build (SPA)

* Set `Build Pack` to `nixpacks`.
* Enable `Is it a static site?`.
* Set `Output Directory` to `out`.

## Deploy with Dockerfile

If you are having problems with Nixpacks or want more control over the building stage, you can use a Dockerfile to deploy your NextJS application.

### Prerequisites

1. Set `Ports Exposes` field to `3000`.
2. Create a `Dockerfile` in the root of your project and copy the content from the official [NextJS Repository](https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile).
3. Set the Build Pack to `Dockerfile`.

---

---
url: /docs/services/nitropage.md
description: >-
  Host NitroPage website builder on Coolify for drag-and-drop page creation,
  templates, and simple website development without coding skills.
---

## What is Nitropage?

Nitropage is an extensible, visual website builder based on SolidStart, offering a growing library of versatile building blocks.

## Deployment Variants

Nitropage is available in two deployment configurations in Coolify:

### Nitropage (Default)

* **Database:** SQLite (embedded)
* **Use case:** Simple deployments, testing, or small websites
* **Components:** Single Nitropage container with built-in SQLite database

### Nitropage with PostgreSQL

* **Database:** PostgreSQL
* **Use case:** Production deployments requiring better performance and scalability
* **Components:**
  * Nitropage container
  * PostgreSQL container
  * Automatic database configuration and health checks

## Features

* Reusable element **Presets** and **Layouts**
* Publishing workflow with **Revisions**
* Starter kit with dozens of Blueprints
* Multiple websites on a single instance
* Image optimization with **focal point** cropping
* API for your custom [SolidJS](https://www.solidjs.com/?utm_source=coolify.io) page elements
* Powerful developer architecture with [Vite](https://vitejs.dev/?utm_source=coolify.io)
* Automatic sitemap.xml and Atom-feed handling

## Video

## Links

* [The official website](https://nitropage.org/?utm_source=coolify.io)
* [GitHub](https://codeberg.org/nitropage/nitropage?utm_source=coolify.io)

---

---
url: /docs/applications/build-packs/nixpacks.md
description: >-
  Build applications with Nixpacks automatic buildpack detecting your codebase,
  generating Dockerfiles, and deploying static sites or dynamic apps.
---

Nixpacks is a open source build pack created by [Railway](https://railway.com?utm_source=coolify.io) and the source is available on [Github](https://github.com/railwayapp/nixpacks?utm_source=coolify.io). Coolify uses Nixpacks as one of the build pack.

Nixpacks checks your git repository (also called as "**source directory**" in nixpacks) and generates a Dockerfile, then it will build a docker image based on the Dockerfile it generated.

Nixpacks can deploy both fully static websites and non-static applications. Once your repository is set up, you can use Coolify to deploy your project with ease.

## How to use Nixpacks?

On Coolify you can only use Nixpacks on git-based deployments.

### 1. Create a New Resource in Coolify

On Coolify dashboard open your project and click the **Create New Resource** button.

### 2. Choose Your Deployment Option

**A.** If your Git repository is public, choose the **Public Repository** option.

**B.** If your repository is private, you can select **Github App** or **Deploy Key**. (These methods require extra configuration. You can check the guides on setting up a [Github App](/applications/ci-cd/github/integration#with-github-app-recommended) or [Deploy Key](/applications/ci-cd/github/integration#with-deploy-keys) if needed.)

### 3. Select Your Git Repository

If you are using a public repository, paste the URL of your GitHub repository when prompted. The steps are very similar for all other options.

### 4. Choose the Build Pack

Coolify will default to using Nixpacks. If it doesnâ€™t, click to select Nixpacks as your build pack.

### 5. Configure Build Pack

We have different options like Base Directory, Publish Directory, and Ports that slightly change based on the application you deploy (static websites/applications). So, below we have two sections for the deployments possible with Nixpacks.

* [How to deploy Fully Static Websites](#how-to-deploy-fully-static-website)
* [How to deploy Non-Static Website/Applications](#how-to-deploy-non-static-website-applications)

## How to deploy Fully Static Website?

First, follow the previous section in this documentation: [How to use Nixpacks](#how-to-use-nixpacks). After that, proceed with the steps below.

1. **Branch:** Coolify will automatically detect the branch from your Repostiory.

2. **Base Directory:** Enter the directory Nixpacks should use as the root (for example, `/` if your files are at the root, or a subfolder if applicable).

   * If you have a monorepo then you can enter the path of the directory you want to use as base directory (`/backend` for example)

3. **Is it a static Site?:** Click on this option to enable static mode.

4. **Port:** Once you enabled `Is it a static Site` the port will be automatically set to `80` and cannot be changed. (This is intentional)

5. **Publish Directory:** Once you enabled `Is it a static Site` this publish directory option will visible on the UI. You have to enter the output directory where your static files are generated (commonly `/dist`).

6. Click on **Continue** button once you have set all the above settings to correct details.

7. Choose a web server for your static website

* As of Coolify **v4.0.0-beta.404**, the only web server option available is [Nginx](https://nginx.org/en/?utm_source=coolify.io). So **Nginx** will be selected by default.

8. Click the **Deploy** button. The deployment process is usually quick (often less than a minute, depending on your server).

9. Customize Your Web Server Configuration&#x20;

* Coolify provides a default web server configuration that works for most cases.

* If you want to change it then click the **Generate** button to load the default settings and make any changes you need.

::: warning HEADS UP!
You have to click on the **Restart** button for the new configuration to take effect.
:::

### How this works?

Nixpacks will build the website using your codebase and create a Docker image with a web server to serve them. This means your final Docker image has a web server ready to serve your HTML, CSS, and JavaScript files.

## How to deploy Non-Static Website/Applications?

First, follow the previous section in this documentation: [How to use Nixpacks](#how-to-use-nixpacks). After that, proceed with the steps below.

1. **Branch:** Coolify will automatically detect the branch from your Repostiory.

2. **Base Directory:** Enter the directory Nixpacks should use as the root (for example, `/` if your files are at the root, or a subfolder if applicable).

   * If you have a monorepo then you can enter the path of the directory you want to use as base directory (`/backend` for example)

3. **Port:** Enter the port where your application listens for incoming requests.

4. **Is it a static Site?:** Leave this unchecked since youâ€™re deploying a non-static application.

5. Click on **Continue** button once you have configured all the above options.

6. After clicking the **Continue** button, you can adjust settings like your domain and environment variables, then click the **Deploy** button to launch your application.

### How this works?

Nixpacks analyzes your codebase, builds a Docker image, and then starts a container using that image.

## Advanced Configuration

### Environment Variables

You can customize Nixpacks' behavior using environment variables. There are many variables available for different application frameworks, and you can find detailed information in their documentation: [Nixpacks Environment Variables](https://nixpacks.com/docs/configuration/environment?utm_source=coolify.io).

To add or modify environment variables in Coolify, simply click on the **Environment Variables** tab, where you can manage them easily.

***

### Commands

If needed, you can override the default install, build, and start commands. Simply scroll down to the build section on Coolify and input your custom commands.

::: warning Note:
You may need to include a `nixpacks.toml` file in your repository for these changes to take effect.
:::

***

### Configuration file

Nixpacks supports specifying build configurations in a nixpacks.toml or nixpacks.json file. If one of these files is present in the root of your repository, it will be automatically used. For more details, refer to the [Nixpacks documentation](https://nixpacks.com/docs/configuration/file?utm_source=coolify.io).

## Known issues and solutions

::: details 1. Outdated Packages/Dependencies
Sometimes, Nixpacks may use older package versions. If you encounter this issue, update the `nixpkgs` archive version in your `nixpacks.toml` file. You can learn more about this in the Nixpacks docs on [nixpkgs archive](https://nixpacks.com/docs/configuration/file#nixpkgs-archive?utm_source=coolify.io)

This is a Nixpacks-related issue, not a Coolify issue. For further assistance, please contact the Nixpacks support team.
:::

---

---
url: /docs/troubleshoot/applications/no-available-server.md
description: >-
  Fix No Available Server (503) errors in Coolify by diagnosing health checks,
  domain configuration, port mismatches, and Traefik routing.
---

# No Available Server (503) Error

If your deployed application or service shows a **"No Available Server"** error, this indicates that [Traefik](/knowledge-base/proxy/traefik/overview) (the reverse proxy) cannot find any (healthy) containers to route traffic to under the provided secured URL (`https`).

## What Causes This Error?

The "No Available Server" error occurs when:

1. **Failed Health Checks** (Most common) - Traefik considers your container unhealthy
2. **Domain Configuration Issues** - Incorrect domain setup or missing www/non-www variants
3. **Port Mismatches** - Exposed ports don't match your application's actual listening port
4. **Deployment Downtime** - Brief downtime during container updates

## Quick Diagnosis Steps

### 1. Check Container Health Status

First, verify if your containers are healthy:

```bash
# SSH into your server and check container status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

Look for containers showing `(unhealthy)` status - this is your primary culprit.

### 2. Check Health Check Configuration

#### Applications

Navigate to your application's configuration and check:

* Is a health check enabled?
* What path is being checked?
* What port is the health check using?

#### Service Stacks

Look in your `docker-compose.yml` for the `healthcheck` section and check:

* What command is being run?
* What path is being checked?
* What port is the health check using?

You can find this either in the Coolify UI by clicking on the `Edit Compose File` button or in the `Docker Compose` section under `Docker Compose Content (raw)`.

## Common Solutions

### Solution 1: Fix Failed Health Checks (Most Common)

**Symptoms:**

* Container shows as `(unhealthy)` in Docker
* Health check path returns errors
* Missing dependencies (e.g. `curl`/`wget`) in container

**Steps:**

1. **Disable Health Check Temporarily:**

   * Go to your application configuration
   * Disable the health check
   * Restart your application

   If this fixes the issue, then the problem is in your health check.

2. **Fix Health Check Issues:**

   ::: info
   These are some common solutions to fix a health check. Adjust based on your specific application and health check command.
   :::

   **Missing dependencies in container:**

   Ensure that all necessary tools are installed in your Docker image for the health check to work. [Applications](/applications/index) will need either `curl` or `wget` installed.

   ```dockerfile
   # Add curl to your Dockerfile
   RUN apt-get update && apt-get install -y curl
   # OR for Alpine images
   RUN apk add --no-cache curl
   ```

   **Wrong health check path / hostname:**

   Make sure that your app is actually serving the health check endpoint and does not return an error. In most cases, the hostname will be `localhost` or `127.0.0.1`.

   **Port mismatch:**

   * Ensure health check port matches your app's listening port
   * If the app runs on port `3000`, health check should use port `3000`

3. **Test Health Check Manually:**

   If the above hasn't resolved the issue, manually test the health check command inside the container and evaluate the output.

   You can do this by either navigating to your container's `Terminal` tab in Coolify or by SSHing into your server and running:

   ```bash
   # SSH into your server and test a health check which uses curl
   docker exec -it <container-name> curl -f http://localhost:3000/health
   ```

### Solution 2: Fix Domain Configuration

#### Redirect Issues

**Symptoms:**

* Works with auto-generated domain (e.g. `sslip.io`) but not custom domain
* Redirect is set to either `Redirect to www` or `Redirect to non-www`
* Works for root domain but not www (or vice versa)

**Steps:**

1. **Add Both www and non-www Domains:**

   Make sure both, the www and non-www versions of your domain are added in the `Domains` field like so: `https://example.com,https://www.example.com`

2. **Configure Domain Redirection:**

   * Set the `Direction` to `Allow www & non-www` if you want both to work

3. **Restart Application:**
   * Always restart after domain changes

#### HTTPS Issues

If your site is only accessible via HTTP but not HTTPS, check your domain configuration:

* **For HTTPS with SSL**: Use `https://` prefix in the domain field: `https://example.com`
* **For HTTP only**: Use `http://` prefix in the domain field: `http://example.com` (no SSL certificate will be generated)

Make sure the protocol in your domain configuration matches how you want to access your site, then restart your application.

### Solution 3: Fix Port Configuration

**Symptoms:**

* Application / Service works via `http://IP:port` but not via domain (manual port mapping required)
* [Traefik](/knowledge-base/proxy/traefik/overview) can't reach the application

**Steps:**

1. **Check exposed Port:**

   The proxy needs to know which port your application is listening on. Check that the port is configured correctly.

   In [Applications](/applications/index), this is defined in the `Ports Exposes` field.

   In **Service Stacks**, this is defined by either adding the port at the end of the URL in the `Domains` field (e.g. `https://example.com:3000`) or by defining the `EXPOSE` directive in your `Dockerfile`.

2. **Verify Application Listening Address:**

   Your Application / Service might be binding to only `localhost` or `127.0.0.1`, which makes it unreachable from outside the container. Ensure your app listens on all interfaces (`0.0.0.0`).

### Solution 4: Handle Deployment Downtime

**Symptoms:**

* Brief "No Available Server" during deployments
* Happens only during container updates

**Solution: Configure Rolling Updates**

Ensure that `Rolling Updates` are correctly configured. See [Rolling Updates documentation](/knowledge-base/rolling-updates)

### Solution 5: Update Traefik to Fix Docker API Version Issue

**Symptoms:**

* "No Available Server" error appears
* Coolify proxy logs shows the following error message:
  ```py
  Error response from daemon: client version 1.24 is too old. Minimum supported API version is 1.44, please upgrade your client to a newer version
  ```
* Application container is running healthy but visiting the domain shows "No Available Server"

**Root Cause:**
The problem happened because Traefik was hard-coding Docker API versions.

::: info
The Traefik team has released a fix in **v2.11.31** and **v3.6.1**. Starting from v2.11.31 and v3.6.1, Traefik will now auto-negotiate the Docker API version, so this issue shouldn't happen again.
:::

**Solution:**

Coolify won't automatically update Traefik for existing servers.

::: warning Why Coolify don't auto-update for existing servers
Some users have custom configurations (like DNS challenges) that could break when updating to a newer Traefik version. Please check the [Traefik changelog](https://github.com/traefik/traefik/releases) before updating.

* If you're using the default Coolify Traefik configurations, you're safe to update to v3.6.1 without any issues.
* If you're currently on Traefik v2 and don't want to upgrade to v3, you can update to the patched v2.11.31 instead.
  :::

If you're already using Coolify, you'll need to update Traefik manually by follow these steps:

1. **Navigate to Proxy Configuration:**
   * Go to your Coolify dashboard (https://app.coolify.io/ for cloud users) â†’ Servers â†’ \[Your Server] â†’ Proxy â†’ Configuration

2. **Change Traefik Version:**
   * Change the version to: `v3.6.1` (or `v2.11.31` if staying on v2)

3. **Restart Proxy:**
   * Click `Restart Proxy`

**Notes:**

* You need to do this on every server connected to your Coolify instance
* This applies to both self-hosted and Coolify Cloud users
  * (Cloud users: Traefik runs on **your own server** not Coolifyâ€™s so youâ€™ll need to update it yourself by following the guide above)
* If you have changed Docker daemon configs to set Minimum supported API version, then we recommend to revert it as it could potentially cause problems in the future.

## Advanced Debugging

### Check Traefik Configuration

```bash
# View Traefik dynamic configuration
cat /data/coolify/proxy/dynamic/*.yml

# Check Traefik logs
docker logs coolify-proxy -f

# Inspect container labels to verify Traefik routing configuration
docker inspect <your-container-name> --format='{{json .Config.Labels}}' | jq
```

### Check Application Logs

```bash
# Check your application's logs for errors
docker logs <your-container-name> -f
```

### Test Health Check from Inside Container

```bash
# Execute health check command manually
docker exec -it <container-name> /bin/sh
curl -f http://localhost:3000/health
```

## Prevention Tips

1. **Always Use Health Checks:**

   * Implement a `/health` endpoint in your application
   * Ensure all dependencies (e.g. `curl`/`wget`) are available in your container

2. **Test Locally First:**

   * Test your health check endpoint before deploying
   * Verify port configuration matches your app

3. **Monitor Container Status:**

   * Regularly check `docker ps` for unhealthy containers
   * Set up monitoring for health check failures

4. **Use Staging Environment:**
   * Test domain configurations in staging first

## When to Seek Help

If none of these solutions work, join our [Discord community](https://coolify.io/discord) and provide:

* Application logs
* Coolify proxy logs
* Container health status (`docker ps`)
* Domain configuration screenshots
* Health check configuration
* Steps you've already tried

This will help the community diagnose more complex issues specific to your setup.

---

---
url: /docs/services/nocodb.md
description: >-
  Deploy NoCoDB on Coolify as Airtable alternative turning databases into smart
  spreadsheets with REST APIs, forms, and no-code interface.
---

# What is NocoDB?

NocoDB is an open source Airtable alternative. Turns any MySQL, PostgreSQL, SQL Server, SQLite & MariaDB into a smart-spreadsheet.

## Screenshots

## Links

* [The official website](https://nocodb.com/)
* [GitHub](https://github.com/nocodb/nocodb)

---

---
url: /docs/services/nodebb.md
description: >-
  Run NodeBB forum on Coolify for modern community discussions, real-time chat,
  plugins, themes, and social networking platform features.
---

# Nodebb

## What is Nodebb

A next-generation discussion platform.

## Links

* [Official Documentation](https://docs.nodebb.org/?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/server/non-root-user.md
description: >-
  Configure Coolify servers with non-root users using SSH keys and passwordless
  sudo permissions for secure resource management.
---

# Non-root user

You could have a server with a non-root user that will manage your resources instead of the root user.

For this to work, you need to set up the server correctly.

::: danger Caution
**This is an experimental feature.**
:::

## Requirements

* The non-root user needs to have the SSH key added to the server.
* Sudos permissions for the non-root user.

## Sudo permissions

You need to add the following lines to the `/etc/sudoers` file:

```bash
# Allow the your-non-root-user to run commands as root without a password
your-non-root-user ALL=(ALL) NOPASSWD: ALL
```

This will allow the non-root user to any command as root without a password.
Note: you need to replace "your-non-root-user" with your user.

::: warning Caution
This is not the most secure way to set up a non-root user, but we will improve
this in the future, by adding more granular permissions on binaries.
:::

---

---
url: /docs/knowledge-base/notifications.md
description: >-
  Configure multi-channel notifications in Coolify with Email, Telegram,
  Discord, Slack, and Pushover for deployments, backups, and server monitoring
  alerts.
---

# Notifications

Coolify provides a robust notification system that supports multiple channels. You can configure notifications in the **Notifications** tab of your Coolify dashboard.

## Notification Providers

Below are guides for setting up supported notification providers in Coolify.

### Email

::: info
Email notifications can be configured using either SMTP or Resend.
:::

1. Navigate to **Notifications** â†’ **Email**

2. Choose your email provider:
   * Use system wide (transactional) email settings (if you self-host Coolify, you can set this up in the Instance Settings - If you use Coolify Cloud, this is set up for you).
   * SMTP Server
   * Resend

3. Configure your chosen provider:

#### System-Wide Email Settings

* Enable the `Use system wide (transactional) email settings` checkbox
* If you're setting this up yourself, please refer to the [SMTP Server Configuration](#smtp-server-configuration) section below for detailed settings.

#### SMTP Server Configuration

* Fill in the following fields:
  * `From Name` - Display name for the sender
  * `From Address` - Email address notifications will come from
  * `Host` - SMTP server hostname (e.g., smtp.mail.com)
  * `Port` - SMTP port:
    * Port 587 - StartTLS port (most widely supported)
    * Port 465 - TLS/SSL port (recommended for highest security)
  * `Username` - SMTP authentication username
  * `Password` - SMTP authentication password
  * `Encryption` - Choose your encryption method:
    * StartTLS - Starts unencrypted then upgrades to TLS via StartTLS (typically used with port 587)
    * TLS/SSL - Uses TLS encryption from the start (typically used with port 465 - automatically puts `ssl://` in front of the host)
    * None - No encryption (NOT recommended as it is highly insecure)
  * `Timeout` - Connection timeout in seconds
* Enable the SMTP Server via the `Enabled` checkbox

::: success Tip
We recommend using TLS/SSL encryption with port 465 for the most secure connection. This provides encryption from the start of the connection.
:::

::: info
Some hosting providers have specific port restrictions. For example, Hetzner blocks port 465 by default. Check with your hosting provider about port availability and any required configuration changes.
:::

#### Resend Configuration

* Enter your `Resend API Key`
* Enable the `Resend` checkbox

4. Click `Send Test Email` to verify your setup

### Telegram

1. Initial Setup (Setup only possible on phone)
   * Create a Telegram account using your phone number
   * Open the Telegram app on your phone
   * Go to **Settings** â†’ **Profile**
   * Set up a username (recommended)

2. Create Your Bot
   * Message [@BotFather](https://t.me/botfather)
   * Send the `/newbot` command
   * Follow BotFather's instructions to create your bot
   * Copy the `Bot Token` when displayed

::: info
After copying your bot token, delete the message containing it from Telegram. Store the token securely as anyone with access to it can control your bot.
:::

3. Create and add your bot to a group
   * Create a new group in Telegram
   * Add your bot to the group (you can add it by using the bot name chosen while creating the bot)

4. Make the bot an admin of the group
   * Click on the group name
   * Locate the members list
   * Click on the bot name
   * Click on **Add to group or channel**
   * Choose the group
   * Enable the `admin` toggle
   * Click on **Add bot as admin**

5. Enable Topics (Optional, Setup only possible on phone)
   * Open the group on your phone
   * Tap the group name
   * Tap the pencil icon (edit)
   * Find and enable **Topics** (this enables threads for the group)
   * You can now create topics using the 3-dot menu in the group (also works on desktop)

6. Get Required IDs
   * Visit: `https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getUpdates` (Replace `{YOUR_BOT_TOKEN}` with your actual bot token)
   * Send a test message in your group or thread/topic
   * Find these values in the response:
     * `Chat ID`: Look for `"chat": {"id": -100XXXXXXXXX,` (for groups/channels, the chat ID usually starts with `-100`)
     * `Thread/Topic ID` (if using threads): Look for `"message_thread_id":XXXXX,`

7. Configure Coolify
   * Go to **Notifications** â†’ **Telegram**
   * Enter your `bot token` (from step 2)
   * Enter the `chat ID` (include the `-` minus sign if present)
   * Enter the `thread/topic ID` (only if you are using threads)
   * Save settings
   * Enable the Telegram channel
   * Send a `Test notification`

::: info
Common issues:

* Make sure the bot is an admin in the group/channel
* Include the minus sign (-) in the chat ID if present
* If `getUpdates` returns an empty response, send another message and try again
* if you can not acces `getUpdates` make sure you have the correct bot token and you have replace the `{YOUR_BOT_TOKEN}` with your actual bot token (replace everything including the quotes)
  :::

### Discord

1. Create a Discord Server and Channel
   * Create a new server or use an existing one
   * Create a new text channel for Coolify notifications

2. Create a webhook
   * Open Discord server settings
   * Go to **Integrations** â†’ **Webhooks**
   * Click **New Webhook**
   * Choose the channel you created for Coolify notifications
   * Copy the `webhook URL`

3. Configure in Coolify:
   * Go to **Notifications** â†’ **Discord**
   * Paste the `webhook URL` in the Webhook URL field
   * Save the settings
   * Enable the Discord channel
   * Send a `Test notification`

::: info
See [Discord's Webhook Guide](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) for more detailed setup instructions.
:::

### Slack

1. Create a Slack App
   * Visit [Slack API](https://api.slack.com/apps)
   * Click **Create New App** â†’ **From scratch**
   * Choose your workspace

2. Enable webhooks:
   * Go to **Incoming Webhooks**
   * Toggle **Activate Incoming Webhooks**
   * Click **Add New Webhook to Workspace**
   * Choose a channel for Coolify notifications
   * Copy the `webhook URL`

3. Configure in Coolify:
   * Go to **Notifications** â†’ **Slack**
   * Paste the `webhook URL` in the Webhook URL field
   * Save the settings
   * Enable the Slack channel
   * Send a `Test notification`

### Pushover (Push Notifications)

1. Get User Key
   * Log in or sign up at [Pushover](https://pushover.net)
   * Copy your `User Key` from the top right of the page

2. Create an Application
   * Visit [Create Application](https://pushover.net/apps/build)
   * Fill in application details
   * Create the application
   * Copy the `API Token/Key` from the top left of the page

3. Configure in Coolify:
   * Go to **Notifications** â†’ **Pushover**
   * Enter your `User Key` (from step 1)
   * Enter the `API Key` from your created application (from step 2)
   * Save the settings
   * Enable the Pushover channel
   * Send a `Test notification`

::: info
Pushover allows you to receive notifications on multiple devices including iOS, Android, and desktop.
:::

## Notification Events

You can configure which events trigger notifications in your notification settings:

### Deployments

* Deployment Success
* Deployment Failure
* Container Status changes

### Backups

* Backup Success
* Backup Failure

### Scheduled Tasks

* Task Success
* Task Failure

### Server Events

* Docker Cleanup Success
* Docker Cleanup Failure
* High Disk Usage Alerts
* Server Status Updates

::: success Multiple Channels
You can configure different events for each notification channel. For example, you can send deployment failure notifications to Email and successes to Slack.
:::

---

---
url: /docs/services/ntfy.md
description: >-
  Host ntfy notification service on Coolify for simple pub/sub push
  notifications via HTTP, mobile apps, and scriptable alert delivery.
---

# Ntfy

## What is Ntfy

ntfy is a simple HTTP-based pub-sub notification service. It allows you to send notifications to your phone or desktop via scripts from any computer, and/or using a REST API.

## Links

* [Official Documentation](https://docs.ntfy.sh/?utm_source=coolify.io)

---

---
url: /docs/applications/nuxt.md
description: >-
  Deploy Nuxt applications on Coolify with server builds, static generation, and
  Nitro support using Nixpacks build configurations.
---

# Nuxt

Nuxt is an open source framework that makes web development intuitive and powerful.
Create performant and production-grade full-stack web apps and websites with confidence.

[Example repository.](https://github.com/coollabsio/coolify-examples/tree/main/nuxt)

## Server build (Nuxt, using `nuxt build`)

* Set `Build Pack` to `nixpacks`.
* Set Start Command to `node .output/server/index.mjs`

Alternatively, you can set the `start` script inside package.json to `node .output/server/index.mjs`. Then Nixpacks will automatically use it as the start command.

## Static build (Nuxt, using `nuxt generate`)

* Set `Build Pack` to `nixpacks`.
* Enable `Is it a static site?`.
* Set `Output Directory` to `dist`.

## Nitro server build (Nitro, using `nitro build`)

* Set `Build Pack` to `nixpacks`.
* Set Start Command to `node .output/server/index.mjs`

Alternatively, you can set the `start` script inside package.json to `node .output/server/index.mjs`. Then Nixpacks will automatically use it as the start command.

---

---
url: /docs/knowledge-base/oauth.md
description: >-
  Set up OAuth authentication with GitHub, GitLab, Google, Azure, or Bitbucket
  for secure single sign-on access to your Coolify instance.
---

# OAuth

You can login to coolify with email/password, or with OAuth.
Using OAuth, you can delegate authorization to get a user's email address to an external IDP provider. This lets coolify know that the user owns a specific email address associated with an existing coolify user. This is an alternative to forcing the user to provide a password to coolify to prove they own that same email address. Authorization servers supported by coolify include Azure, BitBucket, Github, Gitlab, and Google.

## Setup OAuth

To setup OAuth for a given IDP, you need to get a client id and a client secret from the authorization server to put into **YOUR\_COOLIFY\_DASHBOARD**/settings/oauth.
You'll also need to set a Redirect URI for the authorization server to send the user's data back to once they have authorized coolify to access their email address.
The Redirect URI to provide to the IDP should be in the format of **YOUR\_COOLIFY\_DASHBOARD**/auth/*PROVIDER*/callback for example.com : https://coolify.example.com/auth/google/callback

* [Google OAuth](https://support.google.com/cloud/answer/6158849?hl=en)
  * Authorized JavaScript origins should be **YOUR\_COOLIFY\_DASHBOARD**
  * Authorized redirect URIs should be the redirect uri you set in **YOUR\_COOLIFY\_DASHBOARD**/settings/oauth for google. for example.com :   https://coolify.example.com/auth/google/callback
* [Github OAuth](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)
  * Homepage URL should be **YOUR\_COOLIFY\_DASHBOARD**
  * Authorization callback URL should be the redirect uri you set in **YOUR\_COOLIFY\_DASHBOARD**/settings/oauth for github. for example.com : https://coolify.example.com/auth/github/callback

---

---
url: /docs/services/observium.md
description: >-
  Monitor networks on Coolify with Observium for SNMP monitoring, device
  discovery, performance graphs, and infrastructure health tracking.
---

## What is Observium?

Observium is a comprehensive network monitoring platform designed to deliver powerful monitoring capabilities, combined with an elegant and intuitive user interface.

## Screenshots

## Links

* [The official website](https://docs.observium.org/?utm_source=coolify.io)

---

---
url: /docs/services/odoo.md
description: >-
  Deploy Odoo ERP on Coolify for integrated business management with CRM,
  e-commerce, accounting, inventory, and 30+ modular applications.
---

# What is Odoo?

Odoo is an open source ERP and CRM software.

## Screenshots

![Odoo Home](https://odoocdn.com/openerp_website/static/src/img/apps/home/speed_4.webp)

![Odoo Search](https://odoocdn.com/openerp_website/static/src/img/apps/home/ctrl-k-630.gif)

## Links

* [The official website](https://www.odoo.com/)
* [GitHub](https://github.com/odoo/odoo)

---

---
url: /docs/services/ollama.md
description: >-
  Run Ollama on Coolify for local LLM hosting supporting Llama, Mistral, Gemma,
  and custom models with REST API for AI applications.
---

## What is Ollama?

Ollama is a lightweight and efficient server for running large language models (LLMs) on your local machine or in the cloud.

It includes OpenWebUI, a web-based interface for interacting with the models.

## Screenshots

## Links

* [The official website](https://ollama.com/?utm_source=coolify.io)
* [GitHub](https://github.com/ollama/ollama?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/how-to/ollama-with-gpu.md
description: >-
  Self-host Ollama LLM with NVIDIA GPU acceleration on Coolify including
  hardware requirements, Docker configuration, and model management setup.
---

# Ollama with GPU

Based on the detailed guide from [geek.sg](https://geek.sg/blog/how-i-self-hosted-llama-32-with-coolify-on-my-home-server-a-step-by-step-guide?ref=coolify.io):

1. **Hardware Requirements**
   * A server with NVIDIA GPU (tested with RTX 3060 12GB)
   * Minimum 32GB RAM recommended
   * Sufficient storage space for models

2. **Software Setup**
   * Install NVIDIA drivers
   * Install NVIDIA Container Toolkit
   * Configure Docker to use NVIDIA runtime

3. **Coolify Configuration**
   * Deploy Ollama through Coolify's one-click installer
   * Modify the Docker compose configuration to include GPU support
   * Add required environment variables for GPU acceleration

4. **Model Management**
   * Pull and manage your preferred LLM models
   * Monitor GPU usage and performance
   * Adjust model parameters as needed

For the complete detailed guide, visit the [original article](https://geek.sg/blog/how-i-self-hosted-llama-32-with-coolify-on-my-home-server-a-step-by-step-guide?ref=coolify.io).

---

---
url: /docs/services/once-campfire.md
description: Here you can find the documentation for hosting Once Campfire with Coolify.
---

## What is Once Campfire?

Once Campfire is a web-based chat application. It supports many of the features you'd
expect, including:

* Multiple rooms, with access controls
* Direct messages
* File attachments with previews
* Search
* Notifications (via Web Push)
* @mentions
* API, with support for bot integrations

## Links

* [Official website](https://once.com/campfire?utm_source=coolify.io)
* [GitHub](https://github.com/basecamp/once-campfire?utm_source=coolify.io)

## Configuration

Once Campfire requires minimal configuration to get started:

### Required Environment Variables

* **SECRET\_KEY\_BASE** - A secure random key for encryption (automatically generated by Coolify)

### Optional Environment Variables

* **VAPID\_PUBLIC\_KEY** - For web push notifications
* **VAPID\_PRIVATE\_KEY** - For web push notifications
* **DISABLE\_SSL** - Set to `true` to disable SSL (default: `true`)
* **SSL\_DOMAIN** - Your domain for SSL configuration
* **SKIP\_TELEMETRY** - Set to `true` to disable telemetry (default: `true`)
* **SENTRY\_DSN** - For error reporting

---

---
url: /docs/services/onedev.md
description: >-
  Host OneDev on Coolify for self-hosted Git server with CI/CD pipelines, issue
  tracking, code review, and complete DevOps platform.
---

# Onedev

## What is Onedev

Git server with CI/CD, kanban, and packages. Seamless integration. Unparalleled experience.

## Links

* [Official Documentation](https://docs.onedev.io/?utm_source=coolify.io)

---

---
url: /docs/services/onetimesecret.md
description: >-
  Share secrets securely on Coolify with One-Time Secret for encrypted message
  sharing that self-destructs after single viewing.
---

## What is Onetime Secret?

A onetime secret is a link that can be viewed only once. A single-use URL.

## Links

* [The official website](https://onetimesecret.com/?utm_source=coolify.io)
* [GitHub](https://github.com/onetimesecret/onetimesecret?utm_source=coolify.io)

---

---
url: /docs/services/open-webui.md
description: >-
  Deploy Open WebUI on Coolify for self-hosted ChatGPT interface supporting
  Ollama, OpenAI, and local LLMs with conversation management.
---

# Open Webui

## What is Open Webui

User-friendly AI Interface (Supports Ollama, OpenAI API, ...)

## Links

* [Official Documentation](https://docs.openwebui.com?utm_source=coolify.io)

---

---
url: /docs/services/openblocks.md
description: >-
  Build apps on Coolify with OpenBlocks low-code platform featuring
  drag-and-drop UI, database connectors, and rapid application development.
---

::: warning SERVICE NOT AVAILABLE
This service is currently not available in Coolify's service catalog.
:::

# What is OpenBlocks?

OpenBlocks is an open source low-code platform.

## Screenshots

![OpenBlocks Preview](https://raw.githubusercontent.com/openblocks-dev/openblocks/develop/docs/.gitbook/assets/Bu2fpz1h01.gif)

## Links

* [The official website](https://www.openblocks.dev/)
* [GitHub](https://github.com/openblocks-dev/openblocks)

---

---
url: /docs/services/openpanel.md
description: >-
  Host OpenPanel analytics on Coolify for privacy-focused web analytics, event
  tracking, user insights without cookies or data collection.
---

# OpenPanel

## What is OpenPanel?

OpenPanel is an open-source alternative to Mixpanel and Plausible for product analytics. It provides privacy-focused analytics with detailed insights about user behavior, events, and conversions. OpenPanel offers real-time analytics, custom event tracking, funnel analysis, and user segmentation while respecting user privacy and giving you full control over your data.

## Links

* [The official website](https://openpanel.dev?utm_source=coolify.io)
* [GitHub](https://github.com/Openpanel-dev/openpanel?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/server/openssh.md
description: >-
  Configure OpenSSH server for Coolify with key-based authentication, proper
  permissions, and automated SSH setup across Ubuntu, Debian, CentOS, and Alpine
  Linux.
---

# OpenSSH

Coolify uses SSH to connect to your server and deploy your applications. This is true even when using the `localhost` server where Coolify is running.

::: warning Caution
The SSH key must not have a passphrase or 2FA enabled for the user used to run the Coolify installation script or the connection will fail.
:::

## SSH Settings Configuration

These settings need to be configured manually before running the Coolify installation script:

1. Edit SSH Configuration

   ```bash
   nano /etc/ssh/sshd_config
   ```

   Ensure these settings are present:

   ```ssh
   PermitRootLogin prohibit-password
   PubkeyAuthentication yes
   ```

   ::: info Note
   The `PermitRootLogin` option can be set to `yes`, `without-password`, or `prohibit-password`. For enhanced security, we recommend using `prohibit-password`.
   :::

   ::: warning Caution!
   Make sure to add your SSH keys to the `~/.ssh/authorized_keys` file before setting `PermitRootLogin` to `prohibit-password`, otherwise you may lock yourself out of the server.
   :::

2. Restart SSH Service

SystemD:

```bash
# Debian/Ubuntu-based (systemd)
systemctl restart ssh  # Or `systemctl restart sshd` if needed

# CentOS/RHEL 7+ (systemd)
systemctl restart sshd
```

OpenRC:

```bash
# Alpine/Gentoo (OpenRC)
rc-service sshd restart

# Older Ubuntu (Upstart)
service sshd restart

# Legacy Linux (SysVinit)
# /etc/init.d/sshd restart
```

## Manual Configuration

::: info Note
The following steps are handled automatically by the Coolify installation script. Manual configuration is only needed if the automatic setup fails.
:::

1. Install OpenSSH Server

   **Ubuntu/Debian/PopOS**

   ```bash
   apt update && apt install -y openssh-server
   systemctl enable --now sshd
   ```

   **CentOS/RHEL/Fedora/Rocky**

   ```bash
   dnf install -y openssh-server
   systemctl enable --now sshd
   ```

   **SLES/openSUSE**

   ```bash
   zypper install -y openssh
   systemctl enable --now sshd
   ```

   **Arch Linux**

   ```bash
   pacman -Sy --noconfirm openssh
   systemctl enable --now sshd
   ```

   **Alpine Linux**

   ```bash
   apk add openssh
   rc-update add sshd
   rc-service sshd start
   ```

2. Configure SSH Settings
   Follow the [SSH Settings Configuration](#ssh-settings-configuration) section above.

3. Generate and Configure SSH Keys
   ```bash
   # Generate SSH key pair
   ssh-keygen -t ed25519 -a 100 \
       -f /data/coolify/ssh/keys/id.root@host.docker.internal \
       -q -N "" -C root@coolify

   # Set correct ownership
   chown 9999 /data/coolify/ssh/keys/id.root@host.docker.internal

   # Add public key to authorized_keys
   mkdir -p ~/.ssh
   cat /data/coolify/ssh/keys/id.root@host.docker.internal.pub >> ~/.ssh/authorized_keys

   # Set proper permissions
   chmod 600 ~/.ssh/authorized_keys
   chmod 700 ~/.ssh
   ```

4. Configure in Coolify UI
   1. Navigate to `Keys & Tokens` menu
   2. Go to `Private Keys` section
   3. Add the private key
   4. Configure the key in your localhost server settings

---

---
url: /docs/services/opnform.md
description: >-
  Create beautiful forms on Coolify with OpnForm featuring drag-and-drop
  builder, custom themes, conditional logic, and analytics for data collection.
---

## What is OpnForm?

OpnForm is an open-source form builder that lets you create beautiful forms and share them anywhere. It's super fast, you don't need to know how to code, and it provides a modern, intuitive interface for building professional forms with advanced features.

## Features

* Drag-and-drop form builder
* Custom themes and branding
* Conditional logic
* File uploads
* Form analytics
* Email notifications
* Custom domains
* No coding required

## Links

* [Official Documentation](https://docs.opnform.com/introduction?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/server/oracle-cloud.md
description: >-
  Configure Oracle Cloud free ARM servers with Coolify including root user
  setup, SSH configuration, firewall rules, and non-root user permissions.
---

# Oracle Cloud

If you are using `Oracle Cloud free ARM server`, you need to do a few extra steps to use it in Coolify, as a `Coolify instance` or just a `remote server`.

## Normal user

Non-root user is in `experimental` mode and works with `sudo`.

* Make sure the ssh key is added to the user's `~/.ssh/authorized_keys` file.
* All configuration is set for sudo. Details [here](/knowledge-base/server/non-root-user).

## Setup Root User

By default, you can't login as root user. You need to do the following steps to enable root user.

1. Switch to root user `sudo su -`
2. Edit `/etc/ssh/sshd_config` and change `PermitRootLogin` to `without-password`.
3. Restart ssh service `service sshd restart`
4. Add a public key to `/root/.ssh/authorized_keys` file which is also defined in your Coolify instance.

## Firewall Rules

This is only required if you self-host Coolify on Oracle ARM server.

By default, Oracle ARM server has a firewall enabled and you need to allow some ports to use Coolify.

For more details, check [this](/knowledge-base/server/firewall) page.

---

---
url: /docs/services/orangehrm.md
description: >-
  Manage HR on Coolify with OrangeHRM for employee records, leave management,
  time tracking, recruitment, and human resource administration.
---

## What is OrangeHRM?

OrangeHRM is a comprehensive Human Resource Management (HRM) System that captures all the essential functionalities required for any enterprise.

## Links

* [The official website](https://orangehrm.com/?utm_source=coolify.io)
* [GitHub](https://github.com/orangehrm/orangehrm?utm_source=coolify.io)

---

---
url: /docs/services/organizr.md
description: >-
  Deploy Organizr dashboard on Coolify for unified homepage with service tabs,
  user management, SSO integration, and organized app access.
---

# Organizr

## What is Organizr

Homelab Services Organizer

## Links

* [Official Documentation](https://docs.organizr.app/?utm_source=coolify.io)

---

---
url: /docs/services/osticket.md
description: >-
  Run osTicket helpdesk on Coolify for ticket management, customer support,
  email integration, and IT service desk automation workflows.
---

# Osticket

## What is Osticket

osTicket is a widely-used open source support ticket system.

## Links

* [Official Documentation](https://docs.osticket.com/en/latest/?utm_source=coolify.io)

---

---
url: /docs/applications/ci-cd/other-providers.md
description: >-
  Connect any Git provider to Coolify using deploy keys and webhooks for
  automatic deployments. Works with Gogs, Forgejo, and custom Git servers.
---

# Other Git Providers

This guide will show you how to use other Git provider with Coolify, such as Gogs, Forgejo, and any other Git-compatible platform.

## Public Repositories

You can use public repositories from any Git provider without any additional setup.

1. Select the `Public repository` option in Coolify when you create a new resource.
2. Add your repository URL to the input field, for example: `https://git.example.com/username/repository`

::: warning Caution
You can only use the HTTPS URL.
:::

3. That's it! Coolify will automatically pull the latest version of your repository and deploy it.

## Private Repositories

Private repositories require deploy keys for authentication.

### With Deploy Keys

1. Add a private key (aka `Deploy Keys`) to Coolify and to your Git repository in the repository settings (usually under `Settings` / `Deploy Keys` or `SSH Keys`).

::: warning Caution

* You can generate a new key pair with the following command:

```bash
ssh-keygen -t ed25519 -C "coolify_deploy_key"
```

* Or you can also use Coolify to generate a new key for you in the `Keys & Tokens` menu.
  :::

2. Create a new resource and select the `Private Repository (with deploy key)`
3. Add your repository URL to the input field, for example: `git@git.example.com:username/repository.git`

::: warning Caution
You need to use the SSH URL, so the one that starts with `git@`.
:::

4. That's it! Coolify will automatically pull the latest version of your repository and deploy it.

## Automatic commit deployments (Optional)

For Git providers without direct integration, automatic deployments require triggering the deployment via the Deploy Webhook endpoint.

::: warning Caution
This requires your Git provider to support workflow automation or webhook actions (similar to GitHub Actions).

If your provider doesn't support this, you'll need to trigger deployments manually through the Coolify dashboard.
:::

### Prerequisites

1. Create a [Coolify API Token](/api-reference/authorization) in your Coolify dashboard
2. Get the Deploy Webhook URL from your resource (Your resource â†’ `Webhooks` menu â†’ `Deploy Webhook`)

### Setup with Workflow/CI System

If your Git provider supports workflow automation (like GitHub Actions, GitLab CI, Forgejo Actions, etc.), you can trigger deployments automatically:

1. Add your Coolify API token to your repository secrets (e.g., `COOLIFY_TOKEN`)
2. Add the Deploy Webhook URL to your repository secrets (e.g., `COOLIFY_WEBHOOK`)
3. Create a workflow file that triggers on push events:

```yaml
# Example workflow (syntax varies by provider)
on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Coolify Deployment
        run: |
          curl --request GET "${{ secrets.COOLIFY_WEBHOOK }}" \
            --header "Authorization: Bearer ${{ secrets.COOLIFY_TOKEN }}"
```

4. That's it! Now when you push to your repository, the workflow will trigger and send a request to Coolify to start a new deployment.

::: tip Alternative: Direct Webhooks
Some Git providers allow webhooks to send custom headers. If supported, you can configure a webhook to send a GET request with the `Authorization: Bearer YOUR_TOKEN` header directly to the Deploy Webhook URL, without needing a workflow file.
:::

## Supported Git Providers

This method works with any Git provider that supports standard Git protocols, including:

* Gogs
* Forgejo
* Self-hosted GitLab CE/EE instances
* Custom Git servers (gitolite, etc.)
* Any Git-over-SSH compatible platform

## Comparison with App Integration

| Feature               | Other Providers            | GitHub, GitLab, Bitbucket, Gitea |
| --------------------- | -------------------------- | -------------------------------- |
| Repository access     | âœ… Yes                     | âœ… Yes                           |
| Manual deployments    | âœ… Yes                     | âœ… Yes                           |
| Auto-deploy           | âš ï¸ Requires workflow setup | âœ… Automatic                     |
| Pull request previews | âŒ No                      | âœ… Yes                           |

---

---
url: /docs/services/getoutline.md
description: >-
  Host Outline wiki on Coolify for team knowledge base, documentation, real-time
  collaboration, and beautifully organized information sharing.
---

# What is Outline?

Outline is an open-source collaboration tool that allows you to create and share documents with your team.

## Screenshots

## Links

* [The official website](https://getoutline.com/?utm_source=coolify.io)
* [GitHub](https://github.com/outline/outline?utm_source=coolify.io)

---

---
url: /docs/services/overseerr.md
description: >-
  Deploy Overseerr on Coolify for Plex/Jellyfin media requests with user
  management, discovery, approval workflows, and integration automation.
---

## What is Overseerr?

Overseerr is a request management and media discovery tool built to work with your existing Plex ecosystem.

## Screenshots

## Links

* [The official website](https://overseerr.dev/)
* [GitHub](https://github.com/sct/overseerr)

---

---
url: /docs/knowledge-base/overview.md
description: >-
  Comprehensive Coolify knowledge base covering deployment guides, server setup,
  Git integration, proxy configuration, and troubleshooting resources.
---

# Overview

::: danger Note:
**This Knowledge Base sections is in active development, some contents may not be up to date. They will be updated soon.**

**Browse through the pages on the sidebar on this knowledge base section for more information.**
:::

---

---
url: /docs/services/overview.md
description: >-
  Browse the complete directory of one-click services available in Coolify,
  including databases, development tools, and productivity apps.
---

# Services

This list only includes services that are available as one-click services in Coolify.

***

Looking for a complete list with direct links? View our [All Services Directory](/services/all) for a categorized list of all available services.

---

---
url: /docs/services/owncloud.md
description: >-
  Run ownCloud on Coolify for enterprise file sync, sharing, collaboration,
  encryption, and self-hosted cloud storage with desktop clients.
---

# Owncloud

## What is Owncloud

OwnCloud with Open Web UI integrates file management with a powerful, user-friendly interface.

## Links

* [Official Documentation](https://owncloud.com/docs-guides/?utm_source=coolify.io)

---

---
url: /docs/services/pairdrop.md
description: >-
  Share files on Coolify with PairDrop for local network file transfer, AirDrop
  alternative, and quick peer-to-peer file sharing via browser.
---

![Pairdrop](https://raw.githubusercontent.com/schlagmichdoch/PairDrop/refs/heads/master/public/images/android-chrome-192x192-maskable.png)

## What is Pairdrop?

Pairdrop is a self-hosted file sharing and collaboration platform, offering secure file sharing and collaboration capabilities for efficient teamwork.

## Links

* [The official website](https://pairdrop.net/)
* [GitHub](https://github.com/schlagmichdoch/pairdrop)

---

---
url: /docs/services/palworld.md
description: >-
  Host Palworld dedicated server on Coolify for multiplayer survival gameplay
  with creature collection, base building, and cooperative adventures.
---

## What is Palworld?

Palworld is a multiplayer, open-world survival and crafting game where you can befriend and collect mysterious creatures called "Pals" in a vast world. This service allows you to host a dedicated Palworld server for you and your friends.

## Features

* Dedicated server hosting
* Multiplayer support
* Persistent world
* Custom server configuration
* Save game management

## Links

* [Official Website](https://www.pocketpair.jp/palworld)
* [Steam Page](https://store.steampowered.com/app/1623730/Palworld/)

---

---
url: /docs/services/paperless.md
description: >-
  Manage documents on Coolify with Paperless-ngx for scanning, OCR, tagging,
  full-text search, and digital document management system.
---

# Paperless

## What is Paperless

Paperless-ngx is a community-supported open-source document management system that transforms your physical documents into a searchable online archive so you can keep, well, less paper.

## Links

* [Official Documentation](https://docs.paperless-ngx.com/configuration/?utm_source=coolify.io)

---

---
url: /docs/services/passbolt.md
description: >-
  Deploy Passbolt on Coolify for team password management with end-to-end
  encryption, sharing, access control, and collaborative credentials.
---

## What is Passbolt?

Passbolt is an open source credential platform for modern teams.

A versatile, battle-tested solution to manage and collaborate on passwords, accesses, and secrets. All in one.

## Screenshots

## Links

* [The official website](https://www.passbolt.com/?utm_source=coolify.io)
* [GitHub](https://github.com/passbolt?utm_source=coolify.io)

---

---
url: /docs/services/paymenter.md
description: >-
  Host Paymenter billing on Coolify for web hosting invoicing, client
  management, automated provisioning, and service provider administration.
---

## What is Paymenter?

Paymenter is an open-source billing platform tailored for hosting companies. It simplifies the management of hosting services, providing a seamless experience for both providers and customers. Built on modern web technologies, Paymenter offers a flexible and robust solution for your hosting business needs.

## How to configure Paymenter with Coolify

1. Create a new resource using the **Paymenter** service.
2. Start the resource.
3. Set the correct app URL via the terminal:

Select the Paymenter container and run the following command:

```bash
php artisan app:init
```

4. Create the first admin user:
   ```bash
   php artisan app:user:create
   ```

## Links

* [The official website](https://paymenter.org/)
* [GitHub](https://github.com/Paymenter/Paymenter)
* [Demo](https://demo.paymenter.org/)

---

---
url: /docs/services/penpot.md
description: >-
  Design on Coolify with Penpot open-source Figma alternative for prototyping,
  collaboration, SVG-based design, and web-based UI/UX workflows.
---

![Penpot](https://camo.githubusercontent.com/119ae16473fdd30f3fa077eb2639e9e2639cb3297c5e50c226c0eb25a82ea00d/68747470733a2f2f70656e706f742e6170702f696d616765732f726561646d652f6769746875622d6461726b2d6d6f64652e706e67)

## What is Penpot?

Penpot is an open-source design and prototyping tool that empowers teams to create beautiful, interactive prototypes and collaborate seamlessly.

## Screenshot

![Penpot Preview](https://img.plasmic.app/img-optimizer/v1/img?src=https%3A%2F%2Fimg.plasmic.app%2Fimg-optimizer%2Fv1%2Fimg%2F9e922d089997492bca824e935a55437d.png\&q=75\&f=webp)
![Penpot Preview 2](https://img.plasmic.app/img-optimizer/v1/img?src=https%3A%2F%2Fimg.plasmic.app%2Fimg-optimizer%2Fv1%2Fimg%2Fc57dc0469f1c4c9998c0db050026fa4f.png\&q=75\&f=webp)
![Penpot Preview 3](https://img.plasmic.app/img-optimizer/v1/img?src=https%3A%2F%2Fimg.plasmic.app%2Fimg-optimizer%2Fv1%2Fimg%2Fc6e0f7625ea89b09cfb548dc470eac1d.png\&q=75\&f=webp)

## Links

* [The official website](https://penpot.app/)
* [GitHub](https://github.com/penpot/penpot)

---

---
url: /docs/knowledge-base/persistent-storage.md
description: >-
  Configure persistent Docker volumes and bind mounts for Coolify resources to
  preserve data between deployments with proper path mapping and sharing
  options.
---

# Persistent Storage

You could add persistent storage to your resources, so you can preserve your data between deployments.

This persistent storage could be different in different types of Destinations.

## Docker Engine

If you are using Docker Engine, persistent storage could be a `volume` or a `bind mount` (a file/directory from the host system - your server).

### Volume

To create a volume, you need to define:

* `Name` of the volume.
* `Destination Path` where the volume will be mounted inside the container.

::: warning Caution
The base directory inside the container is `/app`. So if you need to store
your files under `storage` directory, you need to define `/app/storage` as the
destination path.
:::

::: success Tip
To prevent storage overlapping between resources, Coolify automatically adds
the resource's UUID to the volume name.
:::

### Bind Mount

To create a bind mount, you need to define:

* `Name` of the volume, which will be used as a reference.
* `Source Path` from the host system. **No docker volume created in this case.**
* `Destination Path` where the volume will be mounted inside the container.

::: warning Caution
The base directory inside the container is `/app`. So if you need to store
your files under `storage` directory, you need to define `/app/storage` as the
destination path.
:::

::: warning Caution
Share file between more than one container? **NOT RECOMMENDED.**

If you mount the same file to more than one container, you will need to make sure that the proper file locking mechanism is implemented in your resources.
:::

---

---
url: /docs/services/pgbackweb.md
description: >-
  Backup PostgreSQL on Coolify with pgBackWeb for database backups, scheduling,
  restoration, and web-based backup management interface.
---

## What is PG Back Web?

Effortless PostgreSQL backups with a user-friendly web interface!

## Screenshots

## Links

* [The official website](https://github.com/eduardolat/pgbackweb?utm_source=coolify.io)
* [GitHub](https://github.com/eduardolat/pgbackweb?utm_source=coolify.io)

---

---
url: /docs/services/pgadmin.md
description: Here you can find the documentation for hosting pgAdmin with Coolify.
---

# pgAdmin

## What is pgAdmin?

pgAdmin is a web-based database management tool for administering your PostgreSQL databases through a user-friendly interface. It provides a comprehensive set of features for database administration, query development, and data visualization, making it the most popular and feature-rich Open Source administration and development platform for PostgreSQL.

## Links

* [The official website](https://www.pgadmin.org?utm_source=coolify.io)
* [Documentation](https://www.pgadmin.org/docs/pgadmin4/latest/container_deployment.html?utm_source=coolify.io)
* [GitHub](https://github.com/pgadmin-org/pgadmin4?utm_source=coolify.io)

---

---
url: /docs/applications/phoenix.md
description: >-
  Deploy Phoenix framework applications on Coolify with Elixir/Erlang, Nixpacks,
  environment variables, and database integration.
---

# Phoenix

Phoenix is a productive web framework that does not compromise speed and maintainability written in Elixir/Erlang.

## Requirements

* Set `Build Pack` to `nixpacks`
* Set `MIX_ENV` to `prod`
  * It should be a `Build time` environment variable
* Set `SECRET_KEY_BASE` to a random string (https://hexdocs.pm/phoenix/deployment.html#handling-of-your-application-secrets)
  * It should be a `Build time` environment variable
* Set `DATABASE_URL` to your database connection string
  * It should be a `Build time` environment variable
* Set `Ports Exposes` to `4000` (default)

---

---
url: /docs/services/phpmyadmin.md
description: >-
  Manage MySQL on Coolify with phpMyAdmin for database administration, SQL
  queries, table editing, and web-based database management.
---

![phpMyAdmin](https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.phpmyadmin.net%2Fstatic%2Fimages%2Flogo-og.png\&f=1\&nofb=1\&ipt=677560c7ab411b6c57023e2b7d1a9c2e4969aed8c4510c9493acea67fc6b16db\&ipo=images)

## What is phpMyAdmin?

phpMyAdmin is a free and open-source administration tool for MySQL and MariaDB.

## Links

* [The official website](https://www.phpmyadmin.net/)
* [GitHub](https://github.com/phpmyadmin/phpmyadmin)

---

---
url: /docs/services/pi-hole.md
description: >-
  Block ads on Coolify with Pi-hole network-wide ad blocking, DNS filtering,
  tracking protection, and dashboard for home network privacy.
---

# Pi-hole

## What is Pi-hole?

Pi-hole is a network-wide ad blocker that acts as a DNS sinkhole, protecting your devices from unwanted content without installing client-side software. It blocks ads, trackers, and malware at the network level by filtering DNS requests. Pi-hole provides detailed analytics about your network's DNS queries and can significantly improve browsing speed by blocking unwanted content before it reaches your devices.

## Links

* [The official website](https://pi-hole.net?utm_source=coolify.io)
* [GitHub](https://github.com/pi-hole/pi-hole?utm_source=coolify.io)

---

---
url: /docs/services/pingvinshare.md
description: >-
  Share files on Coolify with PingvinShare for temporary file sharing, expiring
  links, password protection, and self-hosted file transfer.
---

::: warning SERVICE NOT AVAILABLE
This service is currently not available in Coolify's service catalog.
:::

# PingvinShare

## What is PingvinShare?

PingvinShare is a self-hosted file sharing platform that combines lightness and beauty. It allows you to easily share files with others through temporary links, supports password protection, expiration dates, and provides a clean, modern interface. PingvinShare is designed to be a lightweight alternative to commercial file sharing services while giving you complete control over your data.

## Links

* [GitHub](https://github.com/stonith404/pingvin-share?utm_source=coolify.io)

---

---
url: /docs/services/plane.md
description: >-
  Manage projects on Coolify with Plane for issue tracking, sprints, roadmaps,
  and modern project management for software development teams.
---

![Plane](https://camo.githubusercontent.com/82feb9c8f8212561ecebe55b26622afa2b11e9943c698d3a28789f0bed77b651/68747470733a2f2f706c616e652d6d61726b6574696e672e73332e61702d736f7574682d312e616d617a6f6e6177732e636f6d2f706c616e652d726561646d652f706c616e655f6c6f676f5f2e77656270)

## What is Plane?

Plane is a free and open-source project management tool that empowers teams to collaborate and manage projects efficiently.

## Screenshots

![Plane Preview](https://plane.so/_next/image?url=https%3A%2F%2Fimages.plane.so%2Fhome%2Fcycles%2Fdesktop-dark.png\&w=1920\&q=75)
![Plane Preview 2](https://plane.so/_next/image?url=https%3A%2F%2Fimages.plane.so%2Fhome%2Fmodules%2Fdesktop-dark.png\&w=1920\&q=75)
![Plane Preview 3](https://plane.so/_next/image?url=https%3A%2F%2Fimages.plane.so%2Fhome%2Fissues%2Fdesktop-dark.webp\&w=1920\&q=75)
![Plane Preview 4](https://plane.so/_next/image?url=https%3A%2F%2Fimages.plane.so%2Fhome%2Fhero%2Fissues-dark.webp\&w=1920\&q=75)

## Links

* [The official website](https://plane.so)
* [GitHub](https://github.com/makeplane/plane)

---

---
url: /docs/services/plausible.md
description: >-
  Deploy Plausible Analytics on Coolify for lightweight, cookieless,
  GDPR-compliant web analytics with privacy-first visitor insights.
---

::: danger SERVICE TEMPORARILY DISABLED
This service is currently disabled in Coolify due to known bugs. The installation is not available until these issues are resolved. Please check the [GitHub repository](https://github.com/coollabsio/coolify) for updates on when this service will be re-enabled.
:::

## What is Plausible Analytics?

Plausible is intuitive, lightweight and open-source web analytics software. It uses no cookies and is fully compliant with GDPR, CCPA and PECR.

## How to deploy Plausible Analytics with Coolify?

Due to trademark issues, we can't provide a fully automated one-click Service installation for Plausible Analytics. But don't worry, it's still very easy to install.

## Installation

1. Add a New Resource and select the `Docker Compose Empty` application deployment type.
2. Copy the following [file](https://raw.githubusercontent.com/coollabsio/coolify/main/templates/compose/plausible.yaml) into the input box (with the comments).
3. Click on the `Save` button.
4. Go to the `Plausible` service's settings page (`Settings` button on the right side).
5. Add your custom domain to the `Domains` input box (you can also edit the domains by clicking on the edit icon next to the autogenerated domain).
6. Click on the `Save` button.
7. Click on the `Deploy` button and wait for the deployment to finish.

## Links

* [The official website](https://plausible.io/)
* [GitHub](https://github.com/plausible/analytics)

---

---
url: /docs/services/plex.md
description: >-
  Stream media on Coolify with Plex server for movies, TV shows, music, photos
  with transcoding, mobile apps, and live TV DVR support.
---

## What is Plex?

Available on almost any device, Plex is the first-and-only streaming platform to offer free ad-supported movies, shows, and live TV together.

## Installation

1. Create the service within Coolify.
2. BEFORE starting the service, set the `PLEX_CLAIM` variable. You can get a claim token here: https://plex.tv/claim
3. If your device supports it, enable hardware transcoding by uncommenting this section in the compose file:

```yaml
#devices:
# - "/dev/dri:/dev/dri"
```

## Screenshots

## Links

* [The official website](https://www.plex.tv/)
* [GitHub](https://github.com/plexinc/pms-docker)

---

---
url: /docs/services/plunk.md
description: >-
  Send emails on Coolify with Plunk for transactional email API, templates,
  analytics, and developer-friendly email delivery service.
---

![Plunk](https://raw.githubusercontent.com/useplunk/plunk/main/assets/card.png)

## What is Plunk?

Plunk is an open-source email platform for AWS.

## Screenshots

![Plunk Advanced Selector](https://raw.githubusercontent.com/useplunk/docs/refs/heads/main/images/advanced-selector.png)
![Plunk Editor](https://raw.githubusercontent.com/useplunk/docs/refs/heads/main/images/editor.png)
![Plunk Action](https://raw.githubusercontent.com/useplunk/docs/refs/heads/main/images/action.png)

## Links

* [The official website](https://useplunk.com)
* [GitHub](https://github.com/useplunk/plunk)

---

---
url: /docs/services/pocket-id.md
description: >-
  Deploy Pocket ID on Coolify for simple OIDC provider with passwordless passkey
  authentication across your self-hosted services.
---

# Pocket ID

## What is Pocket ID?

Pocket ID is a simple OIDC provider for passwordless authentication using [passkeys](https://www.passkeys.io/). It's designed to be straightforward and easy-to-use. It exclusively supports passkey authentication, allowing you to use hardware security keys like Yubikey for secure sign-ins across your self-hosted services.

## Deployment Variants

Pocket ID is available in two deployment configurations in Coolify:

### Pocket ID (Default)

* **Database:** SQLite (embedded)
* **Use case:** Simple deployments, testing, or personal authentication server
* **Components:** Single Pocket ID container with built-in SQLite database

### Pocket ID with PostgreSQL

* **Database:** PostgreSQL
* **Use case:** Production deployments requiring better performance and data reliability
* **Components:**
  * Pocket ID container
  * PostgreSQL container
  * Automatic database configuration and health checks

## Features

* **Passwordless Authentication**: Uses passkeys instead of passwords for better security
* **OIDC Provider**: Integrates with applications that support OpenID Connect
* **Simple Setup**: Easy to install and configure compared to complex alternatives
* **Wide Compatibility**: Works with [various services](https://pocket-id.org/docs/client-examples?utm_source=coolify.io) like Nextcloud, GitLab, and more
* **Passkey Support**: Full support for hardware security keys like Yubikey
* **Self-Hosted**: Maintain complete control over your authentication infrastructure

## Getting Started

Once deployed, you can sign in with the admin account at:

```
https://<your-app-url>/setup
```

Follow the Pocket ID setup wizard to configure your instance and create your first passkey.

## Demo

To see Pocket ID in action, visit the [live demo](https://demo.pocket-id.org/).

:::info
This demo is not affiliated with Coolify.
:::

## Links

* [Official Website](https://pocket-id.org?utm_source=coolify.io)
* [Documentation](https://pocket-id.org/docs/introduction?utm_source=coolify.io)
* [Installation Guide](https://pocket-id.org/docs/setup/installation?utm_source=coolify.io)
* [GitHub](https://github.com/pocket-id/pocket-id?utm_source=coolify.io)

## Additional Resources

* [Proxy Services Guide](https://pocket-id.org/docs/guides/proxy-services?utm_source=coolify.io)
* [Client Examples](https://pocket-id.org/docs/client-examples?utm_source=coolify.io)

---

---
url: /docs/services/pocketbase.md
description: >-
  Deploy PocketBase on Coolify for instant backend with database,
  authentication, file storage, real-time subscriptions in single executable.
---

![PocketBase](https://camo.githubusercontent.com/3b198a3ea92b78b9f56f6ec7c2eea0d81ee57ec8b4e2420cde3e1fecedcbc2c7/68747470733a2f2f692e696d6775722e636f6d2f3571696d6e6d352e706e67)

## What is PocketBase?

PocketBase is an open-source backend-as-a-service (BaaS) that empowers developers to build web and mobile applications faster and easier.

## Links

* [The official website](https://pocketbase.io)
* [GitHub](https://github.com/pocketbase/pocketbase)

---

---
url: /docs/services/portainer.md
description: >-
  Manage Docker on Coolify with Portainer for container management, stack
  deployment, registry access, and web-based Docker administration.
---

# Portainer

## What is Portainer

Portainer is a lightweight management UI for Docker

## Links

* [Official Documentation](https://docs.portainer.io?utm_source=coolify.io)

---

---
url: /docs/databases/postgresql.md
description: >-
  Deploy PostgreSQL databases on Coolify with advanced features, automated
  backups, import/restore capabilities, and 30+ years of reliability.
---

# PostgreSQL

![PostgreSQL](/images/database-logos/postgresql.webp)

## What is PostgreSQL

PostgreSQL is an advanced, open-source object-relational database system known for its reliability, feature robustness, and performance. It has more than 30 years of development and is widely used in the industry.

PostgreSQL, often simply "Postgres", uses and extends the SQL language combined with many features that safely store and scale the most complicated data workloads.

## Links

* [The official website](https://www.postgresql.org/)
* [GitHub](https://github.com/postgres/postgres)

## Import Backups

Coolify can import a database dump into a running PostgreSQL instance using the
**Import Backups** section of the Configuration for the instance.

The database dump can either be a file uploaded to the server, or dragged and
dropped into the Configuration screen directly.

The import command can be customized, but by default it expects a database dump
created using the `pg_dump` command with the `-Fc` flag passed in (custom
format).

For example, the following command connects to a PostgreSQL database running in
a local Docker container named `pg-db` as the database user `postgres` and
writes a dump of the `postgres` database to the file `example-database.sql.gz`:

```bash
docker exec pg-db pg_dump -U postgres -d postgres -Fc >example-database.sql.gz
```

### Note on upgrading PostgreSQL

The **custom** dump format is sensitive to version differences between the dump and
restore commands.

Use the plain (default) or **tar** dump formats to migrate from an older version
of PostgreSQL to a newer version. When using plain format dumps, use `psql` as
the custom import command instead of `pg_restore`.

See the PostgreSQL documentation for `pg_dump` and `pg_restore` for more information.

---

---
url: /docs/services/postgresus.md
description: >-
  Postgresus is a free, open source and self-hosted tool to backup PostgreSQL.
  Make backups with different storages and notifications about progress.
---

## What is Postgresus?

Postgresus is a free, open source and self-hosted tool to backup PostgreSQL. Make backups with different storages and notifications about progress.

## Screenshots

## Links

* [The official website](https://postgresus.com/?utm_source=coolify.io)
* [GitHub](https://github.com/RostislavDugin/postgresus?utm_source=coolify.io)

---

---
url: /docs/services/posthog.md
description: >-
  Run PostHog analytics on Coolify for product analytics, feature flags, session
  replay, A/B testing, and user behavior tracking platform.
---

![PostHog](https://user-images.githubusercontent.com/65415371/205059737-c8a4f836-4889-4654-902e-f302b187b6a0.png)

::: danger SERVICE TEMPORARILY DISABLED
This service is currently disabled in Coolify due to known bugs. The installation is not available until these issues are resolved. Please check the [GitHub repository](https://github.com/coollabsio/coolify) for updates on when this service will be re-enabled.
:::

## What is PostHog?

The single platform to analyze, test, observe, and deploy new features

## Links

* [The official website](https://posthog.com)
* [GitHub](https://github.com/PostHog/posthog)

---

---
url: /docs/services/postiz.md
description: >-
  Schedule social media on Coolify with Postiz for content planning,
  multi-platform posting, analytics, and social media management automation.
---

# Postiz

## What is Postiz

Open source social media scheduling tool.

## Links

* [Official Documentation](https://docs.postiz.com?utm_source=coolify.io)

## Warning

When deployed it will allow registrations from anyone. Ensure you get there first and then set `DISABLE_REGISTRATION=true` if you don't want more self-served registrations.

---

---
url: /docs/services/prefect.md
description: >-
  Orchestrate workflows on Coolify with Prefect for data pipelines, task
  scheduling, monitoring, and modern workflow automation platform.
---

## What is Prefect?

Prefect is an orchestration and observability platform that empowers developers to build and scale workflows quickly.

## Screenshots

## Links

* [The official website](https://www.prefect.io?utm_source=coolify.io)
* [GitHub](https://github.com/PrefectHQ/prefect?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/how-to/private-npm-registry.md
description: >-
  Use private NPM registries with Coolify deployments by configuring .npmrc
  authentication tokens and build environment variables.
---

# Private NPM Registry

If you would like to use a private NPM registry with Coolify, you can do so by following the steps below.

1. Add `.npmrc` file to your project root with the following content:

```bash
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

2. Add the following environment variables to your project as a `build` variable:

```bash
NPM_TOKEN=your_npm_token
```

3. Deploy your application.

---

---
url: /docs/services/privatebin.md
description: >-
  Share text securely on Coolify with PrivateBin for encrypted pastebin,
  self-destructing messages, and zero-knowledge data sharing.
---

# Privatebin

## What is Privatebin

PrivateBin is a minimalist, open source online pastebin where the server has zero knowledge of pasted data.

## Links

* [Official Documentation](https://github.com/PrivateBin/PrivateBin/blob/master/doc/README.md?utm_source=coolify.io)

---

---
url: /docs/services/prowlarr.md
description: >-
  Manage indexers on Coolify with Prowlarr for centralized torrent and usenet
  indexer management integrated with Sonarr and Radarr.
---

## What is Prowlarr?

Prowlarr is an indexer manager/proxy built on the popular \*arr .net/reactjs base stack to integrate with your various PVR apps. Prowlarr supports management of both Torrent Trackers and Usenet Indexers. It integrates seamlessly with Lidarr, Mylar3, Radarr, Readarr, and Sonarr offering complete management of your indexers with no per app Indexer setup required (we do it all).

## Screenshots

## Links

* [The official website](https://prowlarr.com/)
* [GitHub](https://github.com/Prowlarr/Prowlarr)

---

---
url: /docs/services/proxyscotch.md
description: Run your own CORS proxy on Coolify. Works both standalone & with Hoppscotch
---

# Proxyscotch

## What is Proxyscotch

Tiny open-source CORS proxy made by Hoppscotch.

> Works well with Hoppscotch, but can be used standalone as well.

## Setup Instructions

> This is only needed for when setting up Proxyscotch for a selfhosted instance of Hoppscotch.

If you secure your proxy server ***(recommended & enabled by default)*** you will need to set some ENV vars for your Hoppscotch instance.

##### After you've set up your Proxyscotch instance:

* Go and find the token that Coolify generated for you.

* In the settings for your Hoppscotch instance on coolify, go to **Environment Variables**

* Add a new variable called `VITE_PROXYSCOTCH_ACCESS_TOKEN` and set it to the token you found before.

* Restart the Hoppscotch instance.

* Once it restarts, load the webui & navigate to **Settings > Interceptors**. - Then scroll down to **Proxy**

* Set the proxy URL to the URL of your Proxyscotch instance

> You might have to enable the Proxy via the switch in the dashboard first before you can modify the URL.

You should now have Hoppscotch set-up & working with your own CORS proxy!

## Links

* [Official Documentation](https://github.com/hoppscotch/proxyscotch?utm_source=coolify.io)

---

---
url: /docs/services/pterodactyl.md
description: >-
  Host game servers on Coolify with Pterodactyl panel for Minecraft, CS:GO, ARK
  with web management, Docker isolation, and automation.
---

## What is Pterodactyl?

PterodactylÂ® is a free, open-source game server management panel built with PHP, React, and Go.
Designed with security in mind, Pterodactyl runs all game servers in isolated Docker containers while exposing a beautiful and intuitive UI to end users.

Pterodactyl consists of two core components that work together: the **Panel** (web interface) and **Wings** (server daemon). The Panel provides the management interface, while Wings handles the actual game server operations on each node.

## Current Features

* Multi-server management from one dashboard
* Secure daemon (Wings) with process isolation
* Docker-based containerization for each server
* Web-based dashboard
* Role-based user permissions
* Real-time CPU, RAM, and network monitoring
* Automated server updates and backups

## What is Wings?

Wings is Pterodactyl's server control daemon, written in Go. It runs on each server node and handles all game server operations including creation, management, and monitoring of server instances.

Wings communicates with the Pterodactyl Panel via its REST API, receiving commands and configuration while sending back real-time statistics, console output, and status updates. Each game server runs in an isolated Docker container managed by Wings.

Key capabilities:

* **Server lifecycle management** - Start, stop, restart, and configure game servers
* **Docker container orchestration** - Automatic provisioning and isolation
* **Real-time monitoring** - CPU, RAM, disk, and network usage tracking
* **Console streaming** - Live server console output to the Panel
* **File management** - Handle server files, backups, and scheduled tasks
* **Resource enforcement** - CPU and memory limits per container

## Installation on Coolify

Coolify offers two deployment options for Pterodactyl: a combined Panel + Wings template for single-server setups, or separate deployments for distributed architectures.

### Option 1: Pterodactyl With Wings (Combined Template)

Best for single-server deployments where the Panel and Wings run together.

1. Install the latest **Pterodactyl With Wings** template from **Coolify**.
2. Deploy the template.
3. Visit the panel URL and log in using your admin credentials.
4. Navigate to the **Admin Panel â†’ Locations** and create a new location (e.g., `us`, `eu`, ...).
5. Create a new node and configure the following fields:

   * **FQDN** â†’ `wings-abc1abc2abc3abc4.example.com` (Without `http://` or `https://`)
   * **Communicate Over SSL** â†’ Enabled (Change this only if you know what you're doing)
   * **Daemon Port** â†’ `443` (Important! Coolify automatically forwards port `443 â†’ 8443`)

6) Navigate to the configuration tab of your node and **save the configuration** to a safe location.

7. In Coolify, go to **Persistent Storages** and locate `config.yml`.
   Replace the following values with those from your saved configuration:

   * `uuid`
   * `token_id`
   * `token`
   * `api > ssl > cert`
   * `api > ssl > key`

8. Update your panel domain under `allowed_origins` to match your actual panel domain.

9. Wait approximately 3â€“5 minutes for Wings to restart.
   If the configuration was successful, the **About** section of your node should display your Daemon Version and other information.

10. Your panel is now ready for use.

### Option 2: Separate Panel and Wings Installation

Best for distributed setups where Wings nodes run on different servers than the Panel.

When installing **Wings** separately in Coolify with a reverse proxy, you cannot have it listen directly on port `443` inside the container.
Instead, configure it to use port `8443` internally, while Coolify forwards `443` to `8443`.
The **Pterodactyl Panel** should still be configured to use port `443` externally.

**Steps:**

1. **Generate the Wings config in the Panel**
   * In the Pterodactyl Panel, create a node and download the `config.yml`.
   * Configure the node with:
     * **Hostname** (e.g., `host.example.com`, without `https://`) â€” not an IP address
     * **Port**: `443`
     * **Proxy setting enabled**

2. **Update the config in Coolify**
   * In your Coolify Wings service, open the **Persistent Storages** tab.
   * You'll see `/etc/pterodactyl/config.yml` already present with a default template.
   * Edit it directly, replacing the placeholders with values from the Panel-generated file.
   * Change the `api.port` to `8443`:
     ```yaml
     api:
       host: 0.0.0.0
       port: 8443
     ```

3. **Restart Wings**
   * Once the changes are saved, restart the Wings container to apply the new settings.

## Common Issues

**Node not connecting**

* Ensure your node is configured to use port `443` in the Panel.
* Verify that Wings is configured to use port `8443` internally when using Coolify's reverse proxy.

**Cannot access the server on the node**

* Confirm that you added your panel domain under `allowed_origins` in the Wings configuration.

## Screenshots

### Panel Interface

### Wings Node Management

## Links

* [The official website](https://pterodactyl.io)
* [GitHub Panel](https://github.com/pterodactyl/panel)
* [GitHub Wings](https://github.com/pterodactyl/wings)
* [Documentation](https://pterodactyl.io/project/introduction.html)
* [Community Discord](https://discord.gg/pterodactyl)

---

---
url: /docs/services/qbittorrent.md
description: >-
  Run qBittorrent on Coolify for torrent downloads, RSS automation, web UI,
  sequential downloading, and BitTorrent client management.
---

# Qbittorrent

## What is Qbittorrent

The qBittorrent project aims to provide an open-source software alternative to Î¼Torrent.

## Links

* [Official Documentation](https://docs.linuxserver.io/images/docker-qbittorrent/?utm_source=coolify.io)

---

---
url: /docs/services/qdrant.md
description: >-
  Deploy Qdrant vector database on Coolify for AI embeddings, semantic search,
  similarity matching, and high-performance vector storage.
---

## What is Qdrant?

Qdrant is an AI-native vector database and a semantic search engine. You can use it to extract meaningful information from unstructured data.

## Links

* [The official website](https://qdrant.tech/?utm_source=coolify.io)
* [GitHub](https://github.com/qdrant/qdrant?utm_source=coolify.io)

---

---
url: /docs/services/rabbitmq.md
description: >-
  Host RabbitMQ message broker on Coolify for reliable messaging, queuing,
  routing, and distributed system communication with AMQP protocol.
---

![RabbitMQ](https://www.rabbitmq.com/img/rabbitmq-logo-with-name.svg)

## What is RabbitMQ?

RabbitMQ is an open-source message broker software that implements the Advanced Message Queuing Protocol (AMQP). It provides a messaging system that allows applications to communicate with each other using a messaging protocol.

## Links

* [The official website](https://rabbitmq.com)
* [GitHub](https://github.com/rabbitmq/rabbitmq-server)

---

---
url: /docs/services/radarr.md
description: >-
  Automate movies on Coolify with Radarr for torrent/usenet downloads, quality
  management, metadata, and integration with download clients.
---

## What is Radarr?

See all your upcoming movies in one convenient location. Manual Search Find all the releases, choose the one you want and send it right to your download client.

## Screenshots

## Links

* [The official website](https://radarr.video/)
* [GitHub](https://github.com/Radarr/Radarr)

---

---
url: /docs/services/rallly.md
description: >-
  Schedule meetings on Coolify with Rallly for group polls, availability voting,
  and collaborative event planning without accounts required.
---

# Rallly

## What is Rallly

Rallly is an open-source scheduling and collaboration tool designed to make organizing events and meetings easier.

## Links

* [Official Documentation](https://support.rallly.co/self-hosting/introduction?utm_source=coolify.io)

---

---
url: /docs/troubleshoot/server/raspberry-crashes.md
description: >-
  Fix Raspberry Pi crashes on Coolify by upgrading to 4GB+ RAM or limiting
  Docker memory usage on 2GB models with slow SD card configurations.
---

# Raspberry Pi Crashes

If you're using a Raspberry Pi with only 2GB of RAM, you may experience system crashes even with swap space enabled.

This is likely due to the slower SD cards often used in Raspberry Pis, which can be unstable.

## Solution

* Upgrade to a Raspberry Pi with 4GB+ of RAM for better stability.
* Or, limit Dockerâ€™s memory usage by adding the following configuration to your `/etc/docker/daemon.json` file:
  ```json
  {
  "memory": "1.8g"
  }
  ```

---

---
url: /docs/knowledge-base/how-to/raspberry-pi-os.md
description: >-
  Install Coolify on Raspberry Pi with 64-bit OS setup guide covering Pi Zero 2
  W, Pi 3, 4, and 5 models with SSH configuration.
---

# Raspberry Pi OS Setup Guide

## Prerequisites

To run Coolify on a Raspberry Pi, you will need one of the following Raspberry Pi models:

* Raspberry Pi Zero 2 W
* Raspberry Pi 400
* Raspberry Pi 3 (all models)
* Raspberry Pi 4 (all models)
* Raspberry Pi 5 (all models)

## Installation

1. Download and install the [Raspberry Pi Imager](https://www.raspberrypi.com/software/) on your computer.

2. Insert your microSD card into your computer's card reader.

3. Open Raspberry Pi Imager and select your device:
   * Click `Choose Device`
   * Select your Raspberry Pi model

4. Select the Operating System:

   * Click `Choose OS`
   * Navigate to `Raspberry Pi OS (other)`
   * Select `Raspberry Pi OS Lite (64-bit)`

   ::: warning Caution
   You must select one of the 64-bit OS versions as Coolify is not compatible with 32-bit versions.
   :::

   ::: info Note
   While you can use the full desktop version `Raspberry Pi OS (64-bit)`/`Raspberry Pi OS Full (64-bit)` or even `Ubuntu`, we recommend the `Raspberry Pi OS Lite` version as it uses fewer resources.
   :::

5. Choose your Storage:
   * Click `Choose Storage`
   * Select your microSD card
   * Double-check you've selected the correct drive to avoid data loss

6. Click `Next` and select `Edit settings` for OS Customization.

   * Navigate to `Services` and enable SSH with a public key.

   ::: warning Caution
   The SSH key must not have a passphrase or 2FA enabled, otherwise you will not be able to complete the onboarding process.
   :::

   * Configure other options as needed

7. Finish the installation onto the SD card.

8. Once complete, insert the microSD card into your Raspberry Pi and power it on.

9. After your Raspberry Pi boots up, proceed with the [Coolify installation](/get-started/installation#quick-installation-recommended).

---

---
url: /docs/services/reactive-resume.md
description: >-
  Build resumes on Coolify with Reactive Resume for free resume builder,
  templates, PDF export, and professional CV creation tool.
---

![Reactive Resume](https://camo.githubusercontent.com/34a172f62213af3abf30c655d1a42744d57019f3866b321aa83d9f4d403d5248/68747470733a2f2f692e696d6775722e636f6d2f464663346e795a2e6a7067)

## What is Reactive Resume?

Reactive Resume is an open-source resume builder that allows you to create a professional resume in minutes. It provides a simple and intuitive interface that allows you to create a resume that stands out.

## Links

* [The official website](https://rxresu.me/)
* [GitHub](https://github.com/AmruthPillai/Reactive-Resume)

---

---
url: /docs/services/readeck.md
description: >-
  Save articles on Coolify with Readeck for read-later service, bookmarking,
  full-text search, and distraction-free reading experience.
---

# Readeck

## What is Readeck

Simple web application that lets you save the precious readable content of web pages you like and want to keep forever.

## Links

* [Official Documentation](https://readeck.org/en/docs/?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/proxy/traefik/redirects.md
description: >-
  Configure Traefik URL redirects in Coolify including www to non-www, domain
  forwarding, and HTTPS redirections for applications and services.
---

# Redirects with Traefik

This guide will help you to configure redirects in Coolify with Traefik.

The configuration is slightly different for `Standard Applications` and `Docker Compose` based applications/one-click services.

## Standard Applications

* You need to set both FQDNs for your resource, so for example: `coolify.io,www.coolify.io`
* Add a unique middleware to your resource.

### www -> non-www

```bash
# A similar line is already defined.
traefik.http.routers.<unique_router_name>.rule=Host(`www.coolify.io`) && PathPrefix(`/`)

# You need to add the middleware to the router.
traefik.http.routers.<unique_router_name>.middlewares=example-middleware

# If you have multiple middlewares, you need to add them comma separated.
# traefik.http.routers.<unique_router_name>.middlewares=gzip,example-middleware
#
traefik.http.middlewares.example-middleware.redirectregex.regex=^(http|https)://www\.(.+)
traefik.http.middlewares.example-middleware.redirectregex.replacement=${1}://${2}
traefik.http.middlewares.example-middleware.redirectregex.permanent=true
```

### non-www -> www

```bash
# A similar line is already defined.
traefik.http.routers.<unique_router_name>.rule=Host(`coolify.io`) && PathPrefix(`/`)

# You need to add the middleware to the router.
traefik.http.routers.<unique_router_name>.middlewares=example-middleware

# If you have multiple middlewares, you need to add them comma separated.
# traefik.http.routers.<unique_router_name>.middlewares=gzip,example-middleware
#
traefik.http.middlewares.example-middleware.redirectregex.regex=^(http|https)://(?:www\.)?(.+)
traefik.http.middlewares.example-middleware.redirectregex.replacement=${1}://www.${2}
traefik.http.middlewares.example-middleware.redirectregex.permanent=true
```

### domain -> other domain

```bash
traefik.http.middlewares.redirect-otherdomain.redirectregex.regex=^(https?://)?source-domain\.com(.*)
traefik.http.middlewares.redirect-otherdomain.redirectregex.replacement=https://target-domain.com${2}
traefik.http.middlewares.redirect-otherdomain.redirectregex.permanent=true
```

If you also need to generate a ssl cert for the target-domain, additionally add a routers entry

```bash
traefik.http.routers.redirect-otherdomain.middlewares=redirect-to-https,redirect-otherdomain
traefik.http.routers.redirect-otherdomain.rule=Host(`target-domain.com`) && PathPrefix(`/`)
traefik.http.routers.redirect-otherdomain.entryPoints=https
traefik.http.routers.redirect-otherdomain.tls.certresolver=letsencrypt
traefik.http.routers.redirect-otherdomain.tls=true
```

## Docker Compose based Applications & one-click Services

* You need to set both FQDNs for your resource, so for example: `coolify.io,www.coolify.io`
* You only need add the middleware to the router.

### www -> non-www

```bash
traefik.http.middlewares.example-middleware.redirectregex.regex=^(http|https)://www\.(.+)
traefik.http.middlewares.example-middleware.redirectregex.replacement=${1}://${2}
traefik.http.middlewares.example-middleware.redirectregex.permanent=true
```

### non-www -> www

```bash
traefik.http.middlewares.example-middleware.redirectregex.regex=^(http|https)://(?:www\.)?(.+)
traefik.http.middlewares.example-middleware.redirectregex.replacement=${1}://www.${2}
traefik.http.middlewares.example-middleware.redirectregex.permanent=true
```

## Debugging

You can check, if the traefik settings have been correctly applied, when inspecting your docker target container.

Find your docker container id

```bash
docker ps
```

Inspect the containers labels

```bash
docker inspect <container-id>
```

You can additionally check the traefik container logs, by running

```bash
docker logs -f coolify-proxy
```

---

---
url: /docs/databases/redis.md
description: >-
  Deploy Redis in-memory databases on Coolify with caching, vector database,
  document storage, streaming, and message broker capabilities.
---

# Redis

![Redis](/images/database-logos/redis.svg)

## What is Redis

Redis is an in-memory data store used by millions of developers as a cache, vector database, document database, streaming engine, and message broker. Redis has built-in replication and different levels of on-disk persistence. It supports complex data types (for example, strings, hashes, lists, sets, sorted sets, and JSON), with atomic operations defined on those data types.

## Links

* [The official website](https://redis.io/)
* [GitHub](https://github.com/redis/redis)

---

---
url: /docs/services/redis-insight.md
description: Here you can find the documentation for hosting Redis Insight with Coolify.
---

# Redis Insight

## What is Redis Insight?

Redis Insight is the official GUI for Redis that lets you do both GUI- and CLI-based interactions in a fully-featured desktop GUI client. It provides intuitive tools for visualizing and optimizing data in Redis, making it easier to work with Redis databases through visual representations of your data structures, query performance analysis, and real-time monitoring.

## Links

* [The official website](https://redis.io/insight?utm_source=coolify.io)
* [Documentation](https://redis.io/docs/latest/operate/redisinsight?utm_source=coolify.io)
* [GitHub](https://github.com/RedisInsight/RedisInsight?utm_source=coolify.io)

---

---
url: /docs/services/redlib.md
description: >-
  Browse Reddit on Coolify with Redlib alternative frontend for privacy-focused
  Reddit browsing without tracking or JavaScript requirements.
---

# Redlib

## What is Redlib

An alternative private front-end to Reddit, with its origins in Libreddit.

## Links

* [Official Documentation](https://github.com/redlib-org/redlib?utm_source=coolify.io)

---

---
url: /docs/services/rivet-engine.md
description: >-
  Deploy Rivet Engine with Coolify for building and scaling stateful workloads
  with long-lived processes, durable state, and realtime capabilities.
---

# Rivet Engine

## What is Rivet Engine?

Rivet Engine is the backend engine that powers Rivet Actors at scale. It's an optional component of the Rivet ecosystem that provides enterprise-grade infrastructure for running stateful workloads with long-lived processes, durable state, and realtime capabilities.

While you can use RivetKit (the TypeScript library) with a file system or memory driver for development, Rivet Engine provides production-ready infrastructure for:

* **Automatic scaling** from zero to millions of concurrent actors
* **Distributed state management** with fast, in-memory state storage
* **Actor lifecycle management** with hibernation and instant wake-up
* **Built-in resilience** with automatic failover and recovery
* **Edge deployment** for low-latency global distribution

Think of it as the production runtime that takes your RivetKit actors and scales them effortlessly across distributed infrastructure.

### Key Features

* **Production-Ready Scaling**: Automatically scale from zero to millions of concurrent actors with no cold starts
* **Distributed State Storage**: State is stored on the same machine as your compute for ultra-fast reads and writes with no database latency
* **Actor Lifecycle Management**: Actors automatically hibernate when idle and wake instantly on demand, only consuming resources when active
* **Built-In Realtime**: Native support for WebSockets and SSE for realtime state updates and broadcasting
* **Resilient Infrastructure**: Automatic failover and recovery with state integrity preservation
* **Edge-Ready**: Deploy actors close to users for instant interactions
* **Multi-Runtime Support**: Works with Node.js, Bun, Deno, and Cloudflare Workers
* **API Integration**: RESTful API for managing runners, actors, and namespaces
* **Built on Web Standards**: Uses standard HTTP, WebSockets, and SSE protocols

### Use Cases

Rivet Engine powers applications that require:

* **AI Agents**: Durable AI assistants with persistent memory and realtime streaming capabilities
* **Realtime Collaboration**: Collaborative documents, whiteboards, and tools with CRDTs and realtime synchronization
* **Durable Workflows**: Multi-step workflows with automatic state management and recovery
* **Local-First Applications**: Offline-first apps with server-side synchronization and conflict resolution
* **Chatbots & Automation**: Discord, Slack, or autonomous bots with persistent conversation state
* **Per-User Databases**: Isolated data stores for each user with zero-latency access
* **Multiplayer Games**: Authoritative game servers with realtime state synchronization
* **Background Processing**: Scheduled and recurring jobs without external queue infrastructure
* **Rate Limiting**: Distributed rate limiting with in-memory counters and state

### How It Works

Rivet Engine provides a backend runtime that:

1. **Manages Actors**: Coordinates actor lifecycle, hibernation, and wake-up across distributed infrastructure
2. **Handles State**: Stores actor state in memory for fast access, with persistent backup to storage backends
3. **Routes Requests**: Efficiently routes client requests to the correct actor instance
4. **Scales Dynamically**: Automatically spawns and destroys actor instances based on demand
5. **Ensures Resilience**: Monitors health and automatically recovers failed actors with state preservation

### Integration with RivetKit

Rivet Engine works seamlessly with RivetKit, the TypeScript library for building actors:

* **Development**: Use RivetKit with file system or memory drivers for local development
* **Production**: Deploy to Rivet Engine for automatic scaling and enterprise features
* **Self-Hosted**: Run Rivet Engine on your own infrastructure for full control
* **Managed**: Use Rivet Cloud for 1-click deployment with managed infrastructure

### Deployment Options

Deploy Rivet Engine on:

* **Self-Hosted** (Coolify, Docker, Kubernetes)
* **Cloud Platforms** (Vercel, Railway, AWS ECS, Google Cloud Run, Hetzner)
* **Rivet Cloud** (Managed, 1-click deployment)

### Storage Backends

Rivet Engine supports multiple storage backends for actor state:

* PostgreSQL
* File System
* Memory (development/testing)
* Custom storage adapters

## Links

* [Official website â†—](https://www.rivet.dev/?utm_source=coolify.io)
* [GitHub (Engine) â†—](https://github.com/rivet-dev/rivet?utm_source=coolify.io)
* [GitHub (RivetKit) â†—](https://github.com/rivet-dev/rivetkit?utm_source=coolify.io)
* [Documentation â†—](https://www.rivet.dev/docs/?utm_source=coolify.io)
* [Discord Community â†—](https://rivet.dev/discord?utm_source=coolify.io)

---

---
url: /docs/services/rocketchat.md
description: >-
  Deploy Rocket.Chat on Coolify for team communication, video conferencing, file
  sharing, and open-source Slack alternative with federation.
---

![Rocket Chat](https://raw.githubusercontent.com/RocketChat/Rocket.Chat.Artwork/master/Logos/2020/png/logo-horizontal-red.png)

## What is Rocket.Chat?

Rocket.Chat is an open-source team communication platform that allows you to communicate with your team in a secure and private way. It provides a simple and intuitive interface that allows you to communicate with your team in a secure and private way.

## Screenshots

![Rocket Chat Preview](https://cdn.prod.website-files.com/611a19b9853b7414a0f6b3f6/66d581308d32c005c08e1d32_emergency%20response.avif)
![Rocket Chat Preview 2](https://cdn.prod.website-files.com/611a19b9853b7414a0f6b3f6/66d6b552743cdc359b7b9fda_Group%205006.avif)
![Rocket Chat Preview 3](https://cdn.prod.website-files.com/611a19b9853b7414a0f6b3f6/6298ae98a2113078342a1c9c_team-collaboration.avif)

## Links

* [The official website](https://rocket.chat)
* [GitHub](https://github.com/RocketChat/Rocket.Chat)

---

---
url: /docs/knowledge-base/rolling-updates.md
description: >-
  Deploy zero-downtime application updates with Coolify rolling updates using
  health checks, default container naming, and graceful container transitions.
---

# Coolify Rolling Updates

Rolling updates enable Coolify to seamlessly update your application by starting a new container and gracefully stopping the currently running container.

This approach minimizes downtime and ensures that your service remains available during updates.

## How Rolling Updates Work

When a new update is initiated, Coolify launches a new container instance while the existing container continues running.

Once the new container is confirmed healthy, the old container is stopped. This process is referred to as a *rolling update* and helps reduce service interruptions.

## Conditions for Rolling Updates

For rolling updates to function properly, the following conditions must be met:

* **Health Check Configuration:** A valid health check must be configured and passing.
  * The health check ensures that the new container is fully ready to handle traffic before the old container is terminated.
  * Without a proper health check, the rolling update process cannot verify the containerâ€™s readiness, leading to potential failures.

* **Default Container Naming:** Rolling updates require the use of the default container naming convention.
  * If you set a custom container name, the update process may not be able to correctly manage container instances, which can prevent the rolling update from executing as expected.

* **Shouldnâ€™t be Docker Compose:** Rolling updates are not supported on Docker Compose-based deployments.
  * Docker Compose deployments uses static container names, the update process may not be able to correctly manage container instances, which can prevent the rolling update from executing as expected.

* **Port Mapping:** If a port is mapped to the host machine, the new container cannot bind to the same port during the update process.
  * This can cause conflicts when trying to route traffic to the new container while the old one is still running, preventing the rolling update from being completed successfully.

## Configuring Health Checks

To ensure successful rolling updates, please verify that your application includes a health check endpoint.

This endpoint should return a successful response (e.g., HTTP 200) when the container is operating normally. For more details on configuring health checks for your application, please refer to our [Health Check Guide](/knowledge-base/health-checks).

## Troubleshooting Rolling Updates

If you encounter issues with rolling updates, consider the following steps:

1. **Verify Health Check Configuration:** Make sure that your health check endpoint is correctly implemented and returns a valid response. A failing or misconfigured health check will halt the update process.

2. **Review Container Naming:** Confirm that you are using the default container naming convention. If a custom container name is set, rolling updates will not function as intended.

3. **Check Logs:** Review `coolify-proxy` container or your application container logs for any error messages related to the update process. This may provide additional insights into what might be preventing the rolling update from completing successfully.

---

---
url: /docs/applications/rails.md
description: >-
  Deploy Ruby on Rails applications on Coolify with database migrations, MVC
  pattern support, and automated deployment workflows.
---

# Ruby on Rails

Ruby on Rails is a web-application framework that includes everything needed to create database-backend web applications according to the Model-View-Controller (MVC) pattern.

## Requirements

If you would like to migrate the database during the deployment with `NIXPACKS` build pack, you need to set the following `Start Command`:

```bash
bundle exec rake db:migrate && bundle exec bin/rails server -b 0.0.0.0 -p ${PORT:-3000} -e $RAILS_ENV
```

---

---
url: /docs/services/rybbit.md
description: Here you can find the documentation for hosting Rybbit with Coolify.
---

![Rybbit](/assets/rybbit.BniXzJTc.svg)

## What is Rybbit?

Rybbit is a next-gen, open source, lightweight, cookieless web & product analytics for everyone.

## Configuration

* set frontend URL.
* set backend URL to `$frontend_URL/api` and uncheck the "Strip Prefixes" option.

# Screenshots

## Links

* [Official Website](https://www.rybbit.io/)
* [GitHub](https://github.com/rybbit-io/rybbit)

---

---
url: /docs/services/ryot.md
description: >-
  Track media on Coolify with Ryot for movies, TV shows, books, video games,
  exercises with ratings, reviews, and personal media database.
---

## What is Ryot?

A self hosted platform for tracking various facets of your life - media, fitness etc.

## Links

* [The official website](https://ryot.io/?utm_source=coolify.io)
* [GitHub](https://github.com/ignisda/ryot?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/internal/scalability.md
description: >-
  Scale Coolify applications with traditional horizontal scaling across multiple
  servers using load balancers or Docker Swarm for high availability
  deployments.
---

# Scalability

If your application needs load balancing or high availability here are the options you have in Coolify:

* [Traditional Horizontal Scaling](#traditional-horizontal-scaling)
* [Docker Swarm](#docker-swarm)

::: info Pro Tip
You donâ€™t need to scale your app if you have 0 users. Start simple and scale as your user base grows!
:::

## Traditional Horizontal Scaling

With traditional horizontal scaling, you can deploy your applications on multiple servers, and then use a load balancer to distribute the traffic across them.

This is the most common type of scaling, and it is easy to understand and implement.

### Coolify requirements

1. **Add servers**
   * You need to add and validate the servers in Coolify.
2. **Set a Docker Registry** for your application
   * **Why?** As several servers will need to access the same built image, it needs to be stored in a shared location.

### Infrastructure requirements

1. **Load balancer**
2. **Firewall** - optional, but recommended

### Examples

Which one is the best?

It depends on your needs, but we recommend the `one domain across multiple servers`.

::: info Tip
We also recommend to use [Hetzner](https://coolify.io/hetzner) (referral link) for the servers.

**(The cloud version of Coolify - and all of our other services - is also using Hetzner)**
:::

#### One domain across multiple servers (Recommended)

![load-balance-one-domain](/images/loadbalancer/one-domain.webp)

* **Pros**:
  * Easy to understand and implement.
  * Easy to manage.
  * Easy to scale.
  * No proxy required on the servers.
  * Healthcheck are available for the application, not for the server - see the other option's cons.
* **Cons**:
  * You need a firewall on each server to prevent the servers from being accessed directly - most VPS providers has software firewalls.

#### Multiple domains across multiple servers (Recommended, but more complex)

![load-balance-multiple-domains](/images/loadbalancer/multiple-domains.webp)

* **Pros**:
  * Easy to understand and implement.
  * Easy to manage.
  * Easy to scale.
  * Requires a proxy on the servers - Coolify automatically configures the proxy for you, but it is +1 component that can fail.
  * "Less expensive" (as one server can host multiple applications).
* **Cons**:
  * As a plus proxy is added, there is a small performance hit as the proxy needs to be initialized on each server - not noticable for most use cases.
  * You need bigger servers to host more applications, as more applications will be running on the same server.
  * Healthcheck are not available for each application, only for the server.

## Docker Swarm

Coolify supports Docker Swarm (experimental). You can read more about it [here](/knowledge-base/docker/swarm).

## Kubernetes (planned)

It is just planned, but not in the roadmap yet, so no ETA.
Coolify will eventually support Kubernetes. This will allow you to use the full power of Kubernetes, with the added benefit of having a web interface to manage your applications.

---

---
url: /docs/services/seafile.md
description: >-
  Sync files on Coolify with Seafile for secure cloud storage, team
  collaboration, file versioning, and enterprise-grade document management.
---

## What is Seafile?

Seafile is an open source cloud storage system for file sync, share and document collaboration.

SeaDoc is an extension of Seafile that providing a lightweight online collaborative document feature.

## Links

* [The official website](https://www.seafile.com/en/home/?utm_source=coolify.io)
* [GitHub](https://github.com/haiwen/seafile?utm_source=coolify.io)

---

---
url: /docs/services/searxng.md
description: >-
  Search privately on Coolify with SearXNG metasearch engine aggregating results
  from 70+ sources without tracking or personalization.
---

## What is SearXNG?

SearXNG is a free internet metasearch engine which aggregates results from various search services and databases. Users are neither tracked nor profiled.

## Links

* [The official website](https://docs.searxng.org/?utm_source=coolify.io)
* [GitHub](https://github.com/searxng/searxng?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/server/sentinel.md
description: >-
  Monitor server and container CPU and RAM usage with Coolify's lightweight
  Sentinel container providing Linux API and resource metrics collection.
---

# Sentinel and Metrics

::: danger CAUTION
**This is an experimental feature.**
:::

# Sentinel Overview

[Sentinel](https://github.com/coollabsio/sentinel) is an open-source lightweight container that provides:

* Linux system API
* Server resource monitoring (CPU, RAM usage for now)
* Container resource monitoring (CPU, RAM usage for now)

## Screenshot

## Configuration

### Enable Sentinel

1. Navigate to `Servers` > `<YOUR_SERVER>` > `Configurations` > `General`
2. Find the `Sentinel` section
3. Toggle `Enable Sentinel`
4. Wait a few moments for the container to be downloaded and start.

### Enable Metrics (Optional)

In the same section, you can enable metrics. Once enabled, you will be able to view the following metrics:

* CPU usage
* Memory consumption (RAM Usage)

::: info Note
Metrics collection is currently NOT available for Docker Compose and Service Template based deployments.
:::

## Viewing Metrics

### Server Metrics

Access server-wide metrics at:

`Servers` > `<YOUR_SERVER>` > `Configurations` > `Metrics`

### Container Metrics

View individual container metrics:

1. Navigate to the specific resource
2. Go to the `Configurations` tab
3. Select the `Metrics` tab

---

---
url: /docs/services/sequin.md
description: >-
  Stream database changes on Coolify with Sequin for CDC, event-driven
  architecture, webhooks, and real-time data synchronization workflows.
---

# Sequin

## What is Sequin?

Sequin is the fastest Postgres change data capture (CDC) solution that helps you sync data from your PostgreSQL database to other systems in real-time. It captures database changes and streams them to various destinations, making it perfect for building event-driven architectures, maintaining data consistency across services, and creating real-time analytics pipelines.

## Links

* [The official website](https://sequinstream.com?utm_source=coolify.io)
* [GitHub](https://github.com/sequinstream/sequin?utm_source=coolify.io)

---

---
url: /docs/troubleshoot/server/crash-during-build.md
description: >-
  Fix server crashes during Coolify builds by offloading to external build
  servers, using GitHub Actions, or upgrading server resources for Docker image
  builds.
---

# Server Unresponsive or crashes during Build

Coolify supports two deployment methods: deploying with a **pre-built** Docker image and building from **source**. Knowing which method you're using can help you fix performance problems better.

## 1. Understanding Your Deployment Method

### A. Pre-built Docker Image Deployment

* Coolify starts a new container from an existing Docker image that you or someone else have already built.

### B. Building from Source Deployment

* Coolify builds a Docker image on your server using your applicationâ€™s source code, and then starts a container from this newly created docker image.

## 2. Troubleshooting Performance Issues

If your server becomes very slow or crashes during deployment, consider the following steps based on your deployment method:

* **For Pre-built Image Deployments:**

  * Since the container is started directly from the docker image, high resource usage is most likely due to the running application.
  * **Solution:** Consider upgrading your server to better accommodate the applicationâ€™s resource needs.

* **For Building from Source Deployments:**

  * The docker image build process can overload your server.
  * **Solution:** Offload the build process to an external [Build Server](/knowledge-base/server/build-server), or use an alternative method such as [GitHub Actions](https://docs.github.com/en/actions) to handle the build externally. Alternatively, consider upgrading your serverâ€™s capacity.

* **General Tip:**\
  SSH into your server and run `htop` to monitor processes. Identify any process consuming excessive resources, and kill it if necessary.

## 3. Offloading Builds with GitHub Actions

To reduce the load on your server during deployments, follow this process:

* **Process:**
  * Use [GitHub Actions](https://docs.github.com/en/actions) to build your Docker image externally.
  * Push the built image to a container registry (e.g., [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)).
  * Once the build is complete, configure coolify to deploy the new version automatically.

* **Benefit:** This method minimizes the workload on your server, resulting in smoother deployments.

* **Learn More:** [View our GitHub Actions workflow file](https://github.com/coollabsio/documentation-coolify/blob/main/.github/workflows/production-build.yml).

## Summary

* **Deployment Methods:**
  * **Pre-built Image:** Directly starts a container from an existing image.
  * **Building from Source:** Builds an image on your server before starting a container.
* **Troubleshooting:**
  * Identify if the issue is due to the applicationâ€™s resource needs or the image build process.
  * Upgrade your server or offload builds as needed.
* **Optimization:**
  * Using GitHub Actions to build Docker images externally can significantly reduce local resource usage.

## Support

If none of the above steps work, then follow this:

* **Community Help:** Join our [Discord community](https://coolify.io/discord) and create a post in the support forum channel.
* **What to Share:** The issue you are facing, your server specifications (e.g., operating system, CPU, RAM), and a description of the steps youâ€™ve already tried.

---

---
url: /docs/knowledge-base/server/patching.md
description: >-
  Update server packages from Coolify dashboard with APT, DNF, and Zypper
  support including individual or batch updates and weekly notifications.
---

# Server Patching&#x20;

The **Server Patching** feature lets you update all packages on your server directly from the Coolify dashboard.

## How to Use Server Patching

1. Go to the **Servers** section in the sidebar.
2. Select your server.
3. Click on the **Security** tab.
4. Open the **Server Patching** section.

On this page, you'll see a list of all available package updates.

You can either:

* Update packages **individually** by clicking the **Update** button next to each one.
* Or, click **Update All Packages** to apply all updates at once.

::: warning Note
Coolify **does not** automatically install updates. It only checks for available updates and displays them in the dashboard.

Updates are applied only when you manually click the **Update** or **Update All Packages** button.
:::

## Server Patching Notifications

Coolify checks for updates weekly and sends notifications if any are available.

* Notifications are **enabled by default**.
* You can manage this setting in your **Notification Settings**.

## Supported Package Managers

As of **v4.0.0-beta.419**, server patching is supported for the following package managers:

* **APT**
* **DNF**
* **Zypper**

Support for additional package managers will be added in future updates.

If you'd like to prioritize support for a specific package manager, feel free to start a discussion here: [Coolify Discussions on GitHub](https://github.com/coollabsio/coolify/discussions)

## FAQ

::: details 1. Can I change how frequently Coolify checks for updates?
No, the update check interval is currently fixed.

However, you can manually trigger a check by clicking the **Check now** button on the Server Patching page.

This feature was introduced in **v4.0.0-beta.419**, and weâ€™re focusing on improving it based on user feedback. If you'd like to request customizable check intervals, feel free to start a discussion here: [Coolify Discussions on GitHub](https://github.com/coollabsio/coolify/discussions)
:::

::: details 2. Does Coolify install updates automatically?
**No**, Coolify does not install updates automatically.

Updates are only applied when you manually click the **Update** or **Update all packages** button on the dashboard.
:::

---

---
url: /docs/knowledge-base/cloudflare/tunnels/server-ssh.md
description: >-
  Enable secure SSH access to Coolify servers via Cloudflare Tunnels with
  automated or manual cloudflared installation hiding server IP addresses.
---

# Server SSH Access via Cloudflare Tunnels

Accessing your server using SSH over a Cloudflare Tunnel is a secure and easy way to connect to a remote server while keeping its IP address hidden.

This guide explains how to set it up using Coolify's automated cloudflare tunnel installation.

## Who this is for?

This setup is ideal for people who:

* Want to keep their server's IP address private.
* Want to close all SSH ports on their server.
* Donâ€™t want to rely on static public IPs for accessing their remote server.
* Don't have a static public IP for the server (only applies if you're doing the [manual setup](#manual-setup)).

## Before We Start

* We assume you already have a server running Coolify and you are looking to set up a tunnel to connect a different server to Coolify.
* If you are trying to set up a tunnel on the server where Coolify is running and you donâ€™t have any other servers to connect, you donâ€™t need a SSH tunnel. Coolify already has full root access to the server itâ€™s running on, so thereâ€™s no need for an SSH tunnel in this case.

## How It Works?

A simple high-level overview diagram to give you a visual idea of how this works:

***

# Setup Methods

There are two ways to set this up: automated and manual.

The main difference is that in the manual setup, you install cloudflared yourself, while in the automated setup, Coolify does it for you.

Choose one of the links below for the setup guide:

* [Automated](#automated-setup)
* [Manual Setup](#manual-setup)

## Automated Setup

To use Coolify's automated setup for a Cloudflare Tunnel:

* Your remote server must have a **public IP address** and an **active SSH port** during the initial setup for Coolify to configure the tunnel. After setup, you can close all ports on the server.
* If your server doesnâ€™t have a public IP address, then this automated setup is **not for you**. Please follow the [Manual setup guide](#manual-setup) instead.
* You need a domain that has it's **DNS managed by Cloudflare**.

### Quick Links to Important Sections:

* [Create a Private SSH Key](#_1-create-a-private-ssh-key)
* [Add Public Key to Your Server](#_2-add-public-key-to-your-server)
* [Add your Server to Coolify](#_3-add-your-server-to-coolify)
* [Validate your Server on Coolify](#_4-validate-your-server-on-coolify)
* [Create a Cloudflare Tunnel](#_5-create-a-cloudflare-tunnel)
* [Setup Cloudflare Tunnel on Coolify](#_6-setup-cloudflare-tunnel-on-coolify)

***

::: warning Example Data
The following data is used as an example in this guide. Please replace it with your actual data when following the steps:

* **IPv4 Address of Remote Server:** 203.0.113.1
* **Domain Name:** shadowarcanist.com
* **Username:** root
* **SSH Port:** 22
  :::

***

## 1. Create a Private SSH Key

To create a Private SSH Key, follow these steps:

1. In your Coolify Dashboard, go to **Keys & Tokens**
2. Click the **+ Add** button

You will be prompted to choose a key type, along with providing a name and description for the key.

1. Click on Generate new **ED25519** or **RSA** button to generate a new SSH key.
2. Copy the public key and save it somewhere safe (you'll need it in the next step). Then, click Continue.

## 2. Add Public Key to Your Server

SSH into the server you want to connect to Coolify:

```sh
  ssh root@203.0.113.1
```

Once logged in, add your public key to the authorized keys file:

```sh
  $ echo "<PASTE YOUR PUBLIC KEY INSIDE OF THESE QUOTES>" >> ~/.ssh/authorized_keys
```

## 3. Add your Server to Coolify

To add your server to Coolify, follow these steps:

1. In your Coolify Dashboard, go to **Servers**
2. Click the **+ Add** button

You will be prompted to enter details about your server. Make sure the information you provide is accurate, as Coolify will use these details to access your server.

1. **Name** - Choose a name to easily identify your server in the dashboard.
2. **Description** - (Optional) Provide a description for your server.
3. **IP Address/Domain** - Enter the public IP address of your server.
4. **Port** - Enter the port number your server uses for SSH connections.
5. **User** - Enter the username Coolify will use (it should have root privileges on the server).
6. **Private key** - Select the private key you created in [Step 1](#_1-create-a-private-ssh-key)
7. After filling in the details, click the **Continue** button.

## 4. Validate your Server on Coolify

To validate your server, simply click the **Validate Server & Install Docker Engine** button.

During this process, Coolify will log in to your server and set up everything needed for Coolify to use the server.

Once the validation is completed, your server page will look like this:

## 5. Create a Cloudflare Tunnel

To create a Cloudflare Tunnel, first log in to your Cloudflare account and go to the [Zero Trust](https://one.dash.cloudflare.com/) page.

1. On the Zero Trust page, go to **Networks** in the sidebar.
2. Click on **Tunnels**
3. Click on **Add a tunnel** button

You will be prompted to choose a tunnel type. Click the **Select Cloudflared** button.

You will be prompted to enter a tunnel name. Choose a name that you prefer.

Next you will see the configuration page with multiple options to install cloudflared.

Copy the install command, which contains the token for your tunnel (token starts with "eyJ"). Make sure to save only the token, removing the command part before it, and store it in a safe place, as we need it later.

Scroll down until you see the **Next** button, then click it.

Then, you will be prompted to add a hostname. This is where we expose our SSH tunnel.

1. **Subdomain** - (Optional) You can make SSH accessible on any subdomain. For this guide, we are using the subdomain **ssh**.
2. **Domain** - Choose the domain you want to use for the tunnel.
3. **Path** - Leave this field empty.
4. **Type** - Choose **SSH** (this is very important).
5. **URL** - Enter **localhost:22** If your SSH port is different from 22, use that port instead.
6. After filling in the details, click the **Save Tunnel** button.

## 6. Setup Cloudflare Tunnel on Coolify

To set up the tunnel on Coolify, follow these steps:

Go to the **Servers** page and select the server you want to connect. This is the server you added in [Step 3](#_3-add-your-server-to-coolify)

1. Click on **Cloudflare Tunnels**
2. Click on **Automated** button

You will be prompted to enter the Tunnel Token and SSH domain.

1. Enter your **Tunnel Token** (this is the token we copied in [Step 5](#_5-create-a-cloudflare-tunnel))
2. Enter your **SSH Domain** (this is the subdomain we set up in [Step 5](#_5-create-a-cloudflare-tunnel))
3. Click on **Continue** button.

Coolify will now install **cloudflared** on the server and set everything up automatically. This process will take about 30 seconds to 1 minute.

Once completed, you will see that the Cloudflare tunnel is enabled on the Cloudflare Tunnels page, like this:

At this point, your server's IP address will be automatically updated to the SSH domain by Coolify.

You can now block your SSH port on the server if you wish.

**Congratulations**! You've successfully set up a server that can be accessed by Coolify over SSH using Cloudflare tunnels via your domain.

::: danger HEADS UP!
**The steps above show how to do the automated setup. Below are the steps for the manual setup.**
:::

## Manual Setup

To manually setup Cloudflare Tunnel:

* You need access to your remote server to install cloudflared (a public IP for your server is not required).
* You need a domain that has it's **DNS managed by Cloudflare**.

### Quick Links to Important Sections:

* [Create a Private SSH Key](#_1-create-a-private-ssh-key-1)
* [Add Public Key to Your Server](#_2-add-public-key-to-your-server-1)
* [Create a Cloudflare Tunnel](#_3-create-a-cloudflare-tunnel)
* [Add your Server to Coolify](#_4-add-your-server-to-coolify)
* [Validate your Server on Coolify](#_5-validate-your-server-on-coolify)
* [Setup Cloudflare Tunnel on Coolify](#_6-setup-cloudflare-tunnel-on-coolify-1)

***

::: warning Example Data
The following data is used as an example in this guide. Please replace it with your actual data when following the steps:

* **IPv4 Address of Remote Server:** 203.0.113.1
* **Domain Name:** shadowarcanist.com
* **Username:** root
* **SSH Port:** 22
  :::

***

## 1. Create a Private SSH Key

To create a Private SSH Key, follow these steps:

1. In your Coolify Dashboard, go to **Keys & Tokens**
2. Click the **+ Add** button

You will be prompted to choose a key type, along with providing a name and description for the key.

1. Click on Generate new **ED25519** or **RSA** button to generate a new SSH key.
2. Copy the public key and save it somewhere safe (you'll need it in the next step). Then, click Continue.

## 2. Add Public Key to Your Server

SSH into the server you want to connect to Coolify:

```sh
  ssh root@203.0.113.1
```

This server can be on your local network without a public IP address. All you need is SSH access to the terminal to run commands.

Once logged in, add your public key to the authorized keys file:

```sh
  $ echo "<PASTE YOUR PUBLIC KEY INSIDE OF THESE QUOTES>" >> ~/.ssh/authorized_keys
```

## 3. Create a Cloudflare Tunnel

To create a Cloudflare Tunnel, first log in to your Cloudflare account and go to the [Zero Trust](https://one.dash.cloudflare.com/) page.

1. On the Zero Trust page, go to **Networks** in the sidebar.
2. Click on **Tunnels**
3. Click on **Add a tunnel** button

You will be prompted to choose a tunnel type. Click the **Select Cloudflared** button.

You will be prompted to enter a tunnel name. Choose a name that you prefer.

Next you will see the configuration page with multiple options to install cloudflared.

Select your preferred option and follow the installation instructions provided by Cloudflare on the page.

Scroll down a bit and wait for your server (connector) to appear in the list. Once it appears, click the **Next** button.

Then, you will be prompted to add a hostname. This is where we expose our SSH tunnel.

1. **Subdomain** - (Optional) You can make SSH accessible on any subdomain. For this guide, we are using the subdomain **ssh**.
2. **Domain** - Choose the domain you want to use for the tunnel.
3. **Path** - Leave this field empty.
4. **Type** - Choose **SSH** (this is very important).
5. **URL** - Enter **localhost:22** If your SSH port is different from 22, use that port instead.
6. After filling in the details, click the **Save Tunnel** button.

## 4. Add your Server to Coolify

To add your server to Coolify, follow these steps:

1. In your Coolify Dashboard, go to **Servers**
2. Click the **+ Add** button

You will be prompted to enter details about your server. Make sure the information you provide is accurate, as Coolify will use these details to access your server.

1. **Name** - Choose a name to easily identify your server in the dashboard.
2. **Description** - (Optional) Provide a description for your server.
3. **IP Address/Domain** - Enter the SSH domain of your server (which we set up in the previous step).
4. **Port** - Enter the port number your server uses for SSH connections.
5. **User** - Enter the username Coolify will use (it should have root privileges on the server).
6. **Private key** - Select the private key you created in [Step 1](#_1-create-a-private-ssh-key-1)
7. After filling in the details, click the **Continue** button.

## 5. Validate your Server on Coolify

To validate your server, simply click the **Validate Server & Install Docker Engine** button.

During this process, Coolify will log in to your server and set up everything needed for Coolify to use the server.

Once the validation is completed, your server page will look like this:

## 6. Setup Cloudflare Tunnel on Coolify

To set up the tunnel on Coolify, follow these steps:

Go to the **Servers** page and select the server (which we added in the previous step) you want to connect.

1. Click on **Cloudflare Tunnels**
2. Click on **Manual** button

Once completed, you will see that the Cloudflare tunnel is enabled on the Cloudflare Tunnels page, like this:

**Congratulations**! You've successfully set up a server that can be accessed by Coolify over SSH using Cloudflare tunnels via your domain.

---

---
url: /docs/troubleshoot/server/validation-issues.md
description: >-
  Resolve Coolify server validation errors by verifying SSH private key format
  includes BEGIN and END OPENSSH PRIVATE KEY headers to fix libcrypto errors.
---

# Server Validation Issues

You cannot validate your server because of a validation error.

## Symptoms

* During validation you receive a `error in libcrypto` error.

## Solution

Check your private key added to Coolify if it is correct, it is probably missing a few things, like `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`.

---

---
url: /docs/services/introduction.md
description: >-
  Deploy 200+ pre-configured open-source applications instantly with Coolify's
  one-click services, from development tools to databases.
---

# Services

## What are Services?

Services in Coolify are deployments based on **Docker Compose files** that are stored directly on your server. Unlike [Applications](/applications/introduction), Services are **not connected to a Git source** â€” they don't pull code from a repository or rebuild on commits.

There are two types of Services in Coolify:

### User-Defined Services

These are Docker Compose files that **you manually provide**. You can paste your own `docker-compose.yml` configuration directly into Coolify, and it will deploy and manage it for you. This gives you complete flexibility to deploy any containerized application or stack that you've configured yourself.

To do so, you select the `Docker Compose Empty` option when creating a new Resource.

### One-Click Services

One-Click Services are a curated collection of 200+ popular open-source applications and tools that you can deploy instantly with just a few clicks. These are **pre-configured Docker Compose templates** provided by Coolify, eliminating the complexity of manual setup and configuration.

Instead of writing your own compose file from scratch, you can select from ready-to-use templates that are automatically filled in for you, making self-hosting accessible to everyone.

#### How They Work

Each template has been:

* **Pre-tested and optimized** for reliable deployment
* **Configured with sensible defaults** to work out of the box
* **Integrated with Coolify's features** like automatic SSL and backups

#### What's Included

Our service library includes a wide variety of applications developed by the open-source community:

* **Development Tools**: Code editors, Git platforms, CI/CD solutions
* **Productivity Apps**: Project management, note-taking, collaboration tools
* **Media & Entertainment**: Media servers, photo management, streaming platforms
* **Business Applications**: CRM systems, accounting software, e-commerce platforms
* **Databases & Analytics**: Various database engines, monitoring, and analytics tools
* **Communication**: Chat platforms, email servers, forums
* **And many more...**

#### Key Benefits

* **Instant Deployment**: No need to write Docker Compose files from scratch
* **Automatic Updates**: Services can be updated with a single click
* **Integrated Features**: Automatic SSL certificates and backups
* **Community Tested**: All services are tested and maintained by the community
* **Full Control**: You maintain complete control over your data and infrastructure

#### Contributing New Services

Want to add a service to Coolify's library? We welcome contributions from the community!

You can help by:

* **Suggesting new services** that would benefit the community
* **Contributing Docker Compose configurations** for applications you use
* **Improving existing service configurations** with better defaults or features
* **Writing documentation** to help others use the services effectively

Learn how to contribute new services in our [contribution guide](/get-started/contribute/service).

***

Ready to explore what's available? Check out [all services](/services/overview) in our library.

---

---
url: /docs/services/shlink.md
description: >-
  Shorten URLs on Coolify with Shlink for branded short links, QR codes,
  analytics, and self-hosted URL shortener with REST API.
---

![Shlink](https://raw.githubusercontent.com/shlinkio/shlink.io/main/public/images/shlink-hero.png)

## What is Shlink?

Shlink is an open-source URL shortener that allows you to create a short URL for your website. It provides a simple and intuitive interface that allows you to create a short URL for your website.

## Links

* [The official website](https://shlink.io)
* [GitHub](https://github.com/shlinkio/shlink)

---

---
url: /docs/services/signoz.md
description: >-
  An observability platform native to OpenTelemetry with logs, traces and
  metrics.
---

# SigNoz

## What is SigNoz

SigNoz is an open source observability platform native to OpenTelemetry with logs, traces and metrics.

## Configuring SigNoz

The following steps will guide you through the configuration of SigNoz once you have created the service in Coolify.

### URLs configuration

SigNoz being a whole observability platform, multiple ports need to be exposed for it to work.
The first one is the URL of the UI. You can find it in the "Service URL" field of the Signoz service, for example: `https://signoz.example.com:8080`

Then, you need to expose the Otel Collector, a service which is responsible for receiving traces, metrics and logs from your applications and services.
It supports many different formats such as GRPC, HTTP formats, Prometheus metrics, and [many logs formats](https://signoz.io/docs/userguide/logs/) (FluentBit/FluentD, syslogs, logs from cloud services, ...).

A different port is exposed for each receiver and we need to expose the relevant port for each receiver.
You have two strategies to do so:

* Configuring a different URL for each receiver.
* Directly exposing the ports to the host and the outside world.

Which option you prefer depends on your security needs and how you structure your domains.

#### One subdomain per receiver

This solution only requires you to map your subdomain to the Otel Collector service. We will cover the two default receivers, the HTTP and GRPC receivers.

1. Make sure your subdomains have been registered and point to your server, such as `https://signoz-grpc.example.com` and `https://signoz-http.example.com`.
2. Open the "Otel Collector" service settings.
3. Add your domains with the format `https://<subdomain>.example.com:<port in container>`, separated by commas. For example: `https://signoz-grpc.example.com:4317,https://signoz-http.example.com:4318`

If you want to expose additional ports / receivers, simply add a new address to the list.

#### Exposing the ports on the host

If you prefer to use a single domain for all receivers, you can edit the Docker Compose to directly expose the ports on the otel-collector container:

```yaml
services:
  # ...
otel-collector:
  image: signoz/signoz-otel-collector:latest
  container_name: signoz-otel-collector
  # ...
  ports:
  - 4317:4317 # GRPC Collector
  - 4318:4318 # HTTP Collector
 
  # ...
```

You can now append the port to your service URL to send data to receiver: `https://signoz.example.com:4318`

### Enabling SMTP emailing

SigNoz uses emailing for two things: inviting users and to [send alerts](https://signoz.io/docs/alerts/).

#### SigNoz emails

To enable SMTP emailing (including inviting new team members), you need to set the following variables from the Environment Variables tab of your Coolify service:

* `SIGNOZ_EMAILING_ENABLED` enables emailing capabilities in SigNoz.
* `SIGNOZ_EMAILING_SMTP_ADDRESS` is the address of the SMTP server to use, in the format `host:port`.
* `SIGNOZ_EMAILING_SMTP_FROM` is the email address to use in the From field.
* `SIGNOZ_EMAILING_SMTP_AUTH_USERNAME` and `SIGNOZ_EMAILING_SMTP_AUTH_PASSWORD` are used to authenticate with the SMTP server.

More environment variables are [available to use](https://signoz.io/docs/manage/administrator-guide/configuration/smtp-email-invitations/) to authenticate via Identity / Secret or use TLS instead of SmartTLS. Read [Passing environment variables not included in the template](passing-environment-variables-not-included-in-the-template) to learn how to add them.

#### Alert Manager emails

Email alerts can only be sent if an SMTP server is configured specifically for the alert manager. The global SMTP configuration and the Alert Manager configuration use different environment variables.

**Note**: SigNoz has a current known issue preventing email alerting configuration from being saved. You can track the progress of this [issue in their bug tracker](https://github.com/SigNoz/signoz/issues/8478).

To enable email alerts, you need to set the following variables from the Environment Variables tab of your Coolify service:

* `SIGNOZ_ALERTMANAGER_SIGNOZ_GLOBAL_SMTP__SMARTHOST` is the address of the SMTP server to use, in the format `host:port`.
* `SIGNOZ_ALERTMANAGER_SIGNOZ_GLOBAL_SMTP__FROM` is the email address to use in the From field.
* `SIGNOZ_ALERTMANAGER_SIGNOZ_GLOBAL_SMTP__AUTH__USERNAME` and `SIGNOZ_ALERTMANAGER_SIGNOZ_GLOBAL_SMTP__AUTH__PASSWORD` are used to authenticate with the SMTP server.

More environment variables are [available to use](https://signoz.io/docs/manage/administrator-guide/configuration/alertmanager/) to authenticate via Identity / Secret or use TLS instead of SmartTLS. Read [Passing environment variables not included in the template](passing-environment-variables-not-included-in-the-template) to learn how to add them.

## Links

* [Official Documentation](https://signoz.io/docs/introduction/)
* [OpenTelemetry Documentation](https://opentelemetry.io/)

---

---
url: /docs/services/siyuan.md
description: >-
  A privacy-first, self-hosted, fully open source personal knowledge management
  software for organizing notes with block-based editing and bidirectional
  links.
---

# Siyuan

## What is Siyuan?

Siyuan is a privacy-first personal knowledge management system that supports complete offline usage, as well as end-to-end encrypted data sync. Built with TypeScript and Golang, it offers a unique block-based approach to note-taking that combines the flexibility of outlines with the power of bidirectional linking.

The platform enables you to organize your thoughts and information using interconnected blocks, making it easy to build a comprehensive personal knowledge base. With features like local-first storage, end-to-end encryption, and cross-platform synchronization, Siyuan ensures your data remains private and accessible across all your devices.

## Links

* [Official website](https://b3log.org/siyuan/en/?utm_source=coolify.io)
* [GitHub](https://github.com/siyuan-note/siyuan?utm_source=coolify.io)

---

---
url: /docs/services/slash.md
description: >-
  Manage bookmarks on Coolify with Slash for self-hosted link shortener,
  collections, sharing, and personal URL management with tagging.
---

## What is Slash?

An open source, self-hosted platform for sharing and managing your most frequently used links. Easily create customizable, human-readable shortcuts to streamline your link management.

## Screenshots

![Slash Preview](https://raw.githubusercontent.com/yourselfhosted/slash/main/docs/assets/demo.png)

## Links

* [GitHub](https://github.com/yourselfhosted/slash)

---

---
url: /docs/troubleshoot/dashboard/dashboard-slow-performance.md
description: >-
  Resolve slow Coolify dashboard loading by disabling Cloudflare Rocket Loader,
  checking server location, and optimizing proxy settings for faster
  performance.
---

# Slow Coolify Dashboard Performance

If your Coolify dashboard loads very slow or some pages don't load at all, this might be the guide for you.

## 1. Determine Your Domain Setup

First, ask yourself: **Are you using a domain whose DNS is managed by Cloudflare?**

* **Yes:** The issue is likely due to Cloudflare's [Rocket Loader](https://developers.cloudflare.com/speed/optimization/content/rocket-loader/) feature.
* **No:** The slowdown might be caused by your server or another factor.

## 2. Test with Your Server's IP Address

### A. Open Your Firewall Port

* **Step:** Ensure that port **8000** is open on your firewall.
* **Why:** This lets you access the Coolify dashboard directly without proxy interference.

### B. Access the Dashboard Directly

* **Step:** Open your web browser and navigate to:\
  `http://203.0.113.1:8000` *(Replace `203.0.113.1` with your actual server IP address)*
* **Observation:**
  * If the dashboard feels fast and all pages load correctly, the issue is most likely with Cloudflare [Rocket Loader](https://developers.cloudflare.com/speed/optimization/content/rocket-loader/).
  * If performance doesn't improve, the problem could be related to your server's location or your internet speed.

## 3. Addressing Cloudflare Rocket Loader

If the dashboard is fast via your server IP but slow through your custom domain, try this:

* **Step:** Log into your [Cloudflare dashboard](https://dash.cloudflare.com/).

* **Action:**
  * Go to **Speed** on the sidebar.
  * Then navigate to **Optimization** and click on **Content Optimization**.
  * Switch the toggle for **Rocket Loader** to **Off**.

* **Wait:** Allow a few minutes for the changes to take effect, then visit your Coolify dashboard using your domain.

## 4. Getting Further Assistance

If none of these steps work:

* **Community Help:** Join our [Discord community](https://coolify.io/discord) and post in the support forum channel.
* **What to Share:** Provide a screen recording of the issue you're experiencing and a description of the steps youâ€™ve already tried.

## Summary of Common Issues

* **Cloudflare Rocket Loader:** Most of the time, Rocket Loader causes issues when using a Cloudflare-managed domain
* **Server or Internet Issues:** Unstable internet connections between the server and user can lead to performance problems.

---

---
url: /docs/services/snapdrop.md
description: >-
  Transfer files on Coolify with Snapdrop for local network file sharing,
  AirDrop-style transfers, and instant peer-to-peer file exchange.
---

# What is Snapdrop?

A self-hosted file-sharing service for secure and convenient file transfers, whether on a local network or the internet.

## Links

* [GitHub](https://github.com/RobinLinus/snapdrop)

---

---
url: /docs/services/soketi.md
description: >-
  Deploy Soketi WebSocket server on Coolify for real-time messaging,
  Pusher-compatible protocol, and scalable WebSocket broadcasting.
---

# Soketi

## What is Soketi

Soketi is your simple, fast, and resilient open-source WebSockets server.

## Links

* [Official Documentation](https://docs.soketi.app?utm_source=coolify.io)

---

---
url: /docs/services/soketi-app-manager.md
description: >-
  Manage Soketi apps on Coolify with application configuration, authentication,
  and WebSocket server administration interface.
---

::: warning SERVICE NOT AVAILABLE
This service is currently not available in Coolify's service catalog.
:::

## What is Soketi App Manager ?

Soketi App Manager provides a user-friendly interface for managing your Soketi websocket applications.

You can effortlessly manage multiple websocket applications, streamlining your app management process.

## Screenshots

## Links

* [GitHub](https://github.com/rahulhaque/soketi-app-manager-filament?utm_source=coolify.io)

---

---
url: /docs/services/sonarr.md
description: >-
  Automate TV shows on Coolify with Sonarr for torrent/usenet downloads, quality
  profiles, episode tracking, and media automation.
---

## What is Sonarr?

Sonarr is an internet PVR for Usenet and Torrents. Features Calendar See all your upcoming episodes in one convenient location.

## Screenshots

## Links

* [The official website](https://sonarr.tv/)
* [GitHub](https://github.com/Sonarr/Sonarr)

---

---
url: /docs/services/nexus.md
description: >-
  Run Nexus Repository on Coolify for artifact management, Docker registry, npm,
  Maven, PyPI package hosting, and DevOps dependency storage.
---

## What is Sonatype Nexus

Sonatype Nexus is a repository manager that allows you to store, manage, and distribute your software artifacts. It supports multiple package formats including Maven, npm, Docker, PyPI, and more.

## Versions Available

Coolify offers two versions of Nexus:

* **Nexus (Standard)**: The official x86\_64 architecture version
* **Nexus ARM**: Community Edition for ARM64 architecture, maintained and synced with the official repository

## Setup

* The setup relies on starting as default user "admin" with password "admin123".
* Once the service is running, login with the default credentials and change the password.
* After that, delete `NEXUS_SECURITY_RANDOMPASSWORD=false` line from the compose file and restart the service to apply the changes.

Minimum requirements:

* 4 vCPU
* 3 GB RAM

## Screenshots

## Links

* [The official website](https://help.sonatype.com/en/sonatype-nexus-repository.html?utm_source=coolify.io)
* [GitHub](https://github.com/sonatype/docker-nexus3?utm_source=coolify.io)

---

---
url: /docs/services/sparkyfitness.md
description: >-
  Self-hosted alternative to MyFitnessPal with AI-powered nutrition assistance.
  Track nutrition, exercise, body measurements, and manage your fitness data
  with complete privacy.
---

# SparkyFitness

## What is SparkyFitness

SparkyFitness is a comprehensive fitness tracking and management application designed to help users monitor their nutrition, exercise, and body measurements. It serves as a self-hosted alternative to MyFitnessPal with AI-powered nutrition assistance, giving you complete control over your fitness data.

The application provides tools for daily progress tracking, goal setting, and insightful reports to support a healthy lifestyle with privacy and data ownership at its core.

## Links

* [Official Documentation â€º](https://codewithcj.github.io/SparkyFitness?utm_source=coolify.io)
* [GitHub â€º](https://github.com/CodeWithCJ/SparkyFitness?utm_source=coolify.io)

---

---
url: /docs/applications/build-packs/static.md
description: >-
  Deploy static websites with Nginx web server using pre-built files from Git
  repositories, supporting Astro, Webstudio, and other static generators.
---

Static Build Packs take the files from your project and create a Docker image with a web server to serve them. This means your final Docker image has a web server ready to display your HTML, CSS, and JavaScript files.

Static Build Packs only work if your project is already built (for example, with a static site generator like [Astro](https://astro.build/?utm_source=coolify.io) or [Webstudio](https://webstudio.is/?utm_source=coolify.io)). Once you have the built files, you can upload them to a Git repository and use Coolify to deploy your site.

## How to Use Static Build Pack

### 1. Prepare Your Static Files

First, build your site with your favorite static site generator. This process creates a folder with all the files your site needs (HTML, CSS, JavaScript, etc.).

Next, upload these static files to a Git repository. You can use [GitHub](https://github.com/?utm_source=coolify.io), [GitLab](https://about.gitlab.com/?utm_source=coolify.io), or any other Git service. For this guide, we will use [GitHub](https://github.com/?utm_source=coolify.io) as an example.

### 2. Create a New Resource in Coolify

On Coolify dashboard open your project and click the **Create New Resource** button.

### 3. Choose Your Deployment Option

**A.** If your Git repository is public, choose the **Public Repository** option.

**B.** If your repository is private, you can select **Github App** or **Deploy Key**. (These methods require extra configuration. You can check the guides on setting up a [Github App](/applications/ci-cd/github/integration#with-github-app-recommended) or [Deploy Key](/applications/ci-cd/github/integration#with-deploy-keys) if needed.)

### 4. Select Your Git Repository

If you are using a public repository, paste the URL of your GitHub repository when prompted. The steps are very similar for all options.

### 5. Choose the Build Pack

Coolify will default to using Nixpacks. Click on the Nixpack option, and then select **Static** from the dropdown menu.

This tells Coolify to build your image with a static web server.

### 6. Set the Base Directory

Enter the path where your static files are located:

* If your files are in the root of your repository, just type `/`.
* If they are in a subfolder, type the path to that folder (for example, `/out`).

After setting the base directory, click the **Continue** button.

### 7. Choose a Web Server

As of Coolify **v4.0.0-beta.402**, the only web server option available is [Nginx](https://nginx.org/en/?utm_source=coolify.io). So **Nginx** will be selected by default.

### 8. Enter Your Domain

Type the domain name where you want your site to be available.

If you have multiple domains, separate them with commas.

### 9. Deploy Your Site

Click the **Deploy** button. The deployment process is usually quick (often less than a minute, depending on your server).

Once the deployment is finished, visit your domain in a browser to see your live site.

### 10. Customize Your Web Server Configuration&#x20;

Coolify provides a default web server configuration that works for most cases.

If you want to change it then click the **Generate** button to load the default settings and make any changes you need.

::: warning HEADS UP!
You have to click on the **Restart** button for the new configuration to take effect.
:::

---

---
url: /docs/services/statusnook.md
description: >-
  Monitor status on Coolify with StatusNook for uptime monitoring, status pages,
  incident management, and service availability tracking.
---

![Statusnook](https://github.com/goksan/statusnook/assets/17437810/ff2bb1d4-5d75-4b6e-b8d9-a7227d1aee6c)

## What is Statusnook?

Statusnook allows you to effortlessly deploy a status page and start monitoring endpoints in minutes

## Links

* [The official website](https://statusnook.com)
* [GitHub](https://github.com/goksan/statusnook)

---

---
url: /docs/services/stirling-pdf.md
description: >-
  Process PDFs on Coolify with Stirling-PDF for merging, splitting, compression,
  conversion, OCR, and 50+ PDF manipulation operations.
---

![Stirling PDF](https://raw.githubusercontent.com/Stirling-Tools/Stirling-PDF/main/docs/stirling.png)

## What is Stirling PDF?

A self-hosted PDF editor for secure and convenient file transfers, whether on a local network or the internet.

## Links

* [Official Website](https://stirlingpdf.com)
* [GitHub](https://github.com/Stirling-Tools/Stirling-PDF)

---

---
url: /docs/services/strapi.md
description: >-
  Build APIs on Coolify with Strapi headless CMS for content management,
  REST/GraphQL APIs, admin panel, and customizable backend platform.
---

# Strapi

## What is Strapi

Open-source headless CMS to build powerful APIs with built-in content management.

## Links

* [Official Documentation](https://docs.strapi.io/?utm_source=coolify.io)

---

---
url: /docs/services/supabase.md
description: >-
  Deploy Supabase on Coolify as open-source Firebase alternative with Postgres
  database, authentication, storage, and real-time subscriptions.
---

![Supabase](https://user-images.githubusercontent.com/8291514/213727225-56186826-bee8-43b5-9b15-86e839d89393.png#gh-dark-mode-only)

## What is Supabase?

The open source Firebase alternative.

## Screenshots

## Notes

You can find your anonymous key in the **Environment Variables** area under **SERVICE\_SUPABASEANON\_KEY**.

## Public Port Access

::: warning NOTE:
There is a bug with making database publicly accessible. This bug will be fixed soon. In the meantime, you can use the following workaround:
:::

Set **Supabase Db** to public

Then

Go to the **General** tab then **Edit Compose File**

Then add this line
`ports:       - ${POSTGRES_PORT:-5432}:${POSTGRES_PORT:-5432}`

To

```yaml
supabase-db:
  image: "supabase/postgres:15.6.1.146"
  healthcheck:
    test: "pg_isready -U postgres -h 127.0.0.1"
    interval: 5s
    timeout: 5s
    retries: 10
  depends_on:
    supabase-vector:
      condition: service_healthy
  ports:
    - ${POSTGRES_PORT:-5432}:${POSTGRES_PORT:-5432}
```

And Restart

> NOTE if you are changing the port to a different port altogether to update the POSTGRES\_PORT in the Environment Variables

## Opening ports with ufw-docker

Finally, to allow external access to the PostgreSQL port in a Docker setup, you need to open the port in the firewall using the command:

```bash
ufw route allow proto tcp from any to any port 5432
```

This rule ensures traffic can reach your PostgreSQL database through the Docker network. For more information, read the docs from [ufw-docker](https://github.com/chaifeng/ufw-docker).

### Using Hetzner's firewall UI

If your server is hosted on Hetzner, you may not need ufw-docker. Instead, you can open the relevant database port (e.g., 5432) directly using [Hetzner's firewall UI](https://docs.hetzner.com/cloud/firewalls/overview).

## Links

* [Official Website](https://supabase.io)
* [GitHub](https://github.com/supabase/supabase)

---

---
url: /docs/services/supertokens.md
description: >-
  Add authentication on Coolify with SuperTokens for login, session management,
  user administration, and Auth0 alternative SDKs.
---

# Supertokens

## What is Supertokens

An open-source authentication solution that simplifies the implementation of secure user authentication and session management for web and mobile applications.

## Deployment Variants

SuperTokens is available in two deployment configurations in Coolify:

### SuperTokens with MySQL

* **Database:** MySQL
* **Use case:** Production deployments with MySQL preference
* **Components:**
  * SuperTokens container
  * MySQL container
  * Automatic database configuration and health checks

### SuperTokens with PostgreSQL

* **Database:** PostgreSQL
* **Use case:** Production deployments with PostgreSQL preference
* **Components:**
  * SuperTokens container
  * PostgreSQL container
  * Automatic database configuration and health checks

Both variants provide equivalent functionality - choose based on your database preference or existing infrastructure.

## Links

* [Official Documentation](https://supertokens.com/docs/guides?utm_source=coolify.io)

---

---
url: /docs/get-started/support.md
description: >-
  Get Coolify support through Discord community with 13K+ members, direct email
  support for Cloud users, and core team developer assistance.
---

## Community Support

Join our [Discord community](https://coollabs.io/discord) with over **13K members**, where you can create a post in the **support forum channel** for assistance.

While the community does provide some help, the [Core team](/get-started/team) is actively involved in the forum to ensure questions are addressed.

## Direct Support from Core Developers

If you are a **Coolify Cloud user**, you can reach out via email at **hi@coollabs.io** for direct support from [Andras (Coolifyâ€™s founder)](https://x.com/heyandras). Since he personally handles emails, response times may be delayed.

We highly recommend posting in the **Discord support forum** first, as core team members can escalate issues to the developers ([Andras](https://x.com/heyandras) & [Peak](https://x.com/peaklabs_dev)) if necessary.

## Important Notes

* We are a **small team** (fewer than **6 people**) supporting **140K+ users**, making it challenging to offer direct assistance to everyone. However, we do our best to help as much as possible.
* We are planning a **paid support option** for **self-hosted users**. If you need dedicated support for your **self-hosted instance**, email **hi@coollabs.io** to discuss options.

---

---
url: /docs/knowledge-base/cron-syntax.md
description: >-
  Complete cron syntax reference for Coolify scheduled tasks including standard
  format and predefined schedules like hourly, daily, and weekly.
---

# Supported Cron Syntax

Coolify supports scheduling automated tasks like cleanups, backups, and more using cron syntax.

## Supported Syntax

### Standard Cron Format

Coolify supports the complete standard cron syntax format (`* * * * *`).

### Predefined Schedules

For convenience, Coolify also supports the following predefined schedule strings:

#### Without @ Prefix

* `every_minute` - Runs every minute
* `hourly` - Runs once per hour
* `daily` - Runs once per day
* `weekly` - Runs once per week
* `monthly` - Runs once per month
* `yearly` - Runs once per year

#### With @ Prefix

* `@every_minute` - Runs every minute
* `@hourly` - Runs once per hour
* `@daily` - Runs once per day
* `@weekly` - Runs once per week
* `@monthly` - Runs once per month
* `@yearly` - Runs once per year

---

---
url: /docs/knowledge-base/server/proxies.md
description: >-
  Learn about Traefik and Caddy reverse proxy support in Coolify for routing
  traffic, SSL certificates, and load balancing with switching guide
---

# Supported Proxy

Coolify supports `Traefik` (default) and `Caddy` (experimental) proxies.

## Switch between proxies

Since `beta.237`, we have added support for Caddy and Traefik as proxies. You can switch between them at any time.

Before you switch proxies and if you have an application that was created before `beta.237`, you need to make sure of the following:

1. You must have `caddy_*` or `traefik_*` labels on your resources.

::: success Tip
If you don't have `caddy_*` or `traefik_*` labels:

1. Automatically: A restart of your resource will add the missing labels.

2. Manually:
   * `For Applications`: click on the `Reset to Coolify Default Labels` button.

   * `For Services`: simply save the service - it will automatically add required labels.
     :::

3. You need to restart your service so that the new labels will be applied.

---

---
url: /docs/applications/svelte-kit.md
description: >-
  Deploy SvelteKit applications on Coolify with static builds using
  adapter-static or Node server builds with adapter-node.
---

# SvelteKit

Svelte Kit is a framework for building web applications of all sizes, with a beautiful development experience and flexible filesystem-based routing.

## Static build (`adapter-static`)

You need to use `@sveltejs/adapter-static` ([docs](https://kit.svelte.dev/docs/adapter-static)) adapter to build a static site.

1. Set your site to static `on` (under `Build Pack` section).
2. Set your `Publish Directory` to `/build`

## Node server (`adapter-node`)

You need to use `@sveltejs/adapter-node` ([docs](https://kit.svelte.dev/docs/adapter-node)) adapter to build a node server based SvelteKit app.

1. Set your site to static to `off` (under `Build Pack` section).
2. Set your `Start Command` to `node build`.

---

---
url: /docs/services/swetrix.md
description: >-
  Swetrix is a privacy-friendly and cookieless European web analytics
  alternative to Google Analytics.
---

## What is Swetrix?

Swetrix is a privacy-friendly, cookieless and open-source web analytics alternative to Google Analytics. Designed to be intuitive and not intrusive to your users privacy, Swetrix offers web analytics with real-time data, website speed monitoring, errors tracking, session analytics, and more.

## Screenshots

## Links

* [The official website](https://swetrix.com)
* [GitHub](https://github.com/swetrix/swetrix)
* [Documentation](https://docs.swetrix.com)
* [Community Discord](https://swetrix.com/discord)

---

---
url: /docs/applications/symfony.md
description: >-
  Deploy Symfony PHP applications on Coolify with Nixpacks, Doctrine migrations,
  database connections, and trusted proxy configuration.
---

# Symfony

Symfony is the leading PHP framework to create websites and web applications. Built on top of the Symfony Components.

## Requirements

* Set `Build Pack` to `nixpacks`
* Set `APP_ENV`
* Set `APP_SECRET`
* Set `NIXPACKS_PHP_FALLBACK_PATH` to `/index.php`
* Set `NIXPACKS_PHP_ROOT_DIR` to `/app/public`
* Set `Ports Exposes` to `80`

### Database migrations

If you use Doctrine, you can add the following `Post-deployment script` :

`php bin/console doctrine:migrations:migrate --all-or-nothing --no-interaction`

### Other components

If your application needs a database or Redis, you can simply create them beforehand in the Coolify dashboard.

You will receive the connection strings which you can use in your application and set them as environment variables:

```bash
DATABASE_URL=postgresql://app:!ChangeMe!@127.0.0.1:5432/app?serverVersion=16&charset=utf8

REDIS_HOST=<REDIS_HOST>
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### Trusted proxy

You might need to configure the [trusted proxy](https://symfony.com/doc/current/deployment/proxies.html) :

* Set the environment variable `TRUSTED_PROXIES` with the IP of your server
* Add the following Symfony configuration :

```yaml
# config/packages/framework.yaml

framework:
    trusted_proxies: "%env(TRUSTED_PROXIES)%"
    trusted_headers: ['x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto', 'x-forwarded-port', 'x-forwarded-prefix']
```

### Persistent php.ini customizations

If you want to customize settings from your php.ini file, you can easily do so by using the `php_admin_value` directive and appending them to your `php-fpm.conf` file like this:

```toml
"php-fpm.conf" = '''
[www]
listen = 127.0.0.1:9000
user = www-data
group = www-data
listen.owner = www-data
listen.group = www-data
pm = dynamic
pm.max_children = 50
pm.min_spare_servers = 4
pm.max_spare_servers = 32
pm.start_servers = 18
clear_env = no

php_admin_value[memory_limit] = 512M
php_admin_value[max_execution_time] = 60
php_admin_value[max_input_time] = 60
php_admin_value[post_max_size] = 256M
'''
```

---

---
url: /docs/services/syncthing.md
description: >-
  Sync files on Coolify with Syncthing for continuous file synchronization, P2P
  data replication, and decentralized backup across devices.
---

![Syncthing](https://raw.githubusercontent.com/syncthing/syncthing/main/assets/logo-text-128.png)

## What is Syncthing?

Syncthing synchronizes files between two or more computers in real time.

## Links

* [Official Website](https://syncthing.net)
* [GitHub](https://github.com/syncthing/syncthing)

---

---
url: /docs/services/tailscale-client.md
description: >-
  Connect services securely with Tailscale on Coolify featuring WireGuard VPN,
  mesh networking, zero-config setup, and encrypted peer-to-peer connections.
---

## What is Tailscale Client?

Tailscale securely connects your devices over the internet using WireGuard. It creates a secure mesh network between your devices, servers, and services with zero-configuration required. This client service allows your Coolify deployment to join your Tailscale network.

## Features

* Zero-config WireGuard VPN
* Secure mesh networking
* Encrypted peer-to-peer connections
* Cross-platform support
* Easy device management
* Access control lists
* MagicDNS for easy service discovery

## Links

* [Official Website](https://tailscale.com?utm_source=coolify.io)
* [Documentation](https://tailscale.com/kb?utm_source=coolify.io)
* [GitHub](https://github.com/tailscale/tailscale?utm_source=coolify.io)

---

---
url: /docs/services/teable.md
description: >-
  Build databases on Coolify with Teable as Airtable alternative combining
  spreadsheet interface with database power and automation workflows.
---

# Teable

## What is Teable

Teable is a powerful visual interface built on relational databases (PostgreSQL).

## Links

* [Official Documentation](https://help.teable.io/?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/internal/terminal.md
description: >-
  Access Coolify resources through built-in web terminal with xterm.js, secure
  SSH connections, and Websocket communication for all containers and servers.
---

# Terminal

**Coolify** provides a powerful **built-in web terminal** that offers seamless access to all your resources directly from your browser. This feature enhances your ability to manage and interact with your infrastructure efficiently.

Key features:

1. **Universal Access**: Available for all resources **managed by Coolify**. Any containers or servers.
2. **Supports colors, text editing, and more**: Uses [xterm.js](https://xtermjs.org/) under the hood, so you get a fully featured terminal experience.
3. **Eliminates the need for external SSH clients**: This integrated terminal eliminates the need for external SSH clients or complex connection setups, streamlining your workflow and improving productivity.

#### Is it secure?

Yes, it is. The terminal commands are executed within the Coolify environment and through a secure SSH connection, so you can be sure that your commands are executed securely.

#### How to access?

You can access the terminal from the sidebar.

#### How does it works **exactly**?

The terminal is a web-based interface that allows you to interact with your resources using a terminal emulator and the web-to-terminal communication is passed through a Websocket connection.

After that, it creates a new process on the Terminal server (inside Coolify's realtime container) and connects to your main Coolify instance container, via SSH.

But the connection is not direct, it goes first through a Websocket connection, requiring an authentication to do so, after that, the connection is established inside Coolify's main Instance (host server), to make sure that we have the permissions to access the resources.

And then, the process inside the Coolify's main Instance container, establishes a new SSH connection to the target resource (container or server). Lets see a diagram explaining it better:

![terminal-diagram](/images/terminal/terminal-diagram.webp)

---

---
url: /docs/knowledge-base/server/terminal-access.md
description: >-
  Enable or disable terminal access for servers and containers in Coolify with
  admin-level controls and security permissions management.
---

# Terminal Access&#x20;

The **Terminal Access** feature allows you to enable or disable terminal access for your server and all containers running on it â€” directly from the Coolify dashboard.

## How to Use Terminal Access

1. Go to the **Servers** section in the sidebar.
2. Select your server.
3. Go to the **Configuration** tab.
4. Open the **Advanced** section.
5. Use the toggle button to enable or disable terminal access for the server.

::: warning Note:
Disabling Terminal Access affects **all terminals** on the server, including access to all containers running on that server.
:::

## Terminal Access Control

As of **v4.0.0-beta.419**, only the **root user** and **admin users** have permission to use the Terminal Access feature.

When terminal access is disabled, no one can access the terminal including root and admin users for the server or any of its containers.

---

---
url: /docs/services/tolgee.md
description: >-
  Localize apps on Coolify with Tolgee for translation management, in-context
  editing, collaboration, and internationalization platform.
---

# What is Tolgee?

Tolgee is an open-source translation management platform that allows you to manage your translations in a centralized and collaborative way.

## Screenshots

![Tolgee Preview](https://user-images.githubusercontent.com/18496315/188672133-064d2a26-e414-4f5e-ab43-549af8cb2145.gif)

## Links

* [Official Website](https://tolgee.io)
* [GitHub](https://github.com/tolgee/tolgee-platform)

---

---
url: /docs/services/traccar.md
description: >-
  Track GPS on Coolify with Traccar for vehicle tracking, geofencing, reports,
  notifications, and fleet management with 170+ protocols.
---

# Traccar

## What is Traccar

Traccar is a free and open source modern GPS tracking system.

## Links

* [Official Documentation](https://www.traccar.org/documentation/?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/proxy/traefik/overview.md
description: >-
  Configure Traefik reverse proxy in Coolify with dynamic routing, SSL
  management, load balancing, and dashboard monitoring for containerized
  applications.
---

# Traefik Proxy

[Traefik](https://traefik.io/) is a modern, open-source reverse proxy and load balancer designed to handle incoming requests and route them to the appropriate services. Itâ€™s widely used in the container ecosystem, making it a perfect fit for projects running on Coolify.

By default, Coolify uses Traefik as its proxy, enabling easy management of routing, SSL certificates, and more, without requiring deep technical expertise.

## Why Use Traefik?

* Dynamically manages routing between your apps and the internet.
* Integrates seamlessly with container orchestrators like Docker or Kubernetes.
* Simplifies SSL/TLS certificate management, including support for [Let's Encrypt](https://letsencrypt.org/).
* Offers advanced features like load balancing and middleware for fine-grained control.
* Comes with a built-in dashboard for monitoring routes and configurations.

## When Not to Use Traefik?

* If you need complete control over every aspect of your reverse proxy.
* If you prefer using another reverse proxy solution like [NGINX](https://nginx.org/en/).
* If you have highly customized or complex routing rules that Traefik might not fully support.

## Ways to Use Traefik with Coolify

Coolify automatically configures Traefik as your proxy. However, you can customize and extend Traefik's functionality based on your needs.

Below are some of the key features and ways you can use Traefik with Coolify:

1. [Basic Authentication](/knowledge-base/proxy/traefik/basic-auth) -> Add username and password protection to your applications.

2. [Custom SSL Certificates](/knowledge-base/proxy/traefik/custom-ssl-certs) -> Use your own SSL certificates instead of automatically generated ones.

3. [Dashboard](/knowledge-base/proxy/traefik/dashboard) -> Enable Traefikâ€™s built-in dashboard for real-time monitoring and insights.

4. [Dynamic Configuration](/knowledge-base/proxy/traefik/dynamic-config) -> Manage dynamic configuration changes like routing rules or middlewares.

5. [Health Checks](/knowledge-base/health-checks) -> Configure health checks to ensure your applications are running smoothly.

6. [Load Balancing](/knowledge-base/proxy/traefik/load-balancing) -> Distribute traffic across multiple app instances for better performance.

7. [Redirects](/knowledge-base/proxy/traefik/redirects) -> Set up HTTP-to-HTTPS redirection or create specific URL redirects.

8. [Wildcard Certificates](/knowledge-base/proxy/traefik/wildcard-certs) -> Secure multiple subdomains with a single SSL certificate.

***

::: danger CAUTION!\
**Do not make changes to Traefik's configuration unless you are sure of what you are doing. Incorrect settings can make your entire application inaccessible..**

**We highly recommend testing any changes in a development environment before applying them to production.**
:::

---

---
url: /docs/services/transmission.md
description: >-
  Download torrents on Coolify with Transmission for lightweight BitTorrent
  client, web interface, encryption, and remote control.
---

# Transmission

## What is Transmission

Fast, easy, and free BitTorrent client.

## Links

* [Official Documentation](https://docs.linuxserver.io/images/docker-transmission/?utm_source=coolify.io)

---

---
url: /docs/services/trigger.md
description: >-
  Automate workflows on Coolify with Trigger.dev for background jobs, scheduled
  tasks, webhooks, and event-driven workflow automation.
---

![Trigger](https://camo.githubusercontent.com/eab9fa8c4faf6ea7b868a38aea57abf375fc43233d257bc52314409f279ce541/68747470733a2f2f696d61676564656c69766572792e6e65742f3354627261666675445a34614566384b574f6d495f772f61343564316661322d306165382d346133392d343430392d6634663933346266616530302f7075626c6963)

## What is Trigger?

Trigger is an open source Background Jobs framework for TypeScript.

## Deployment Variants

Trigger.dev is available in two deployment configurations in Coolify:

### Trigger.dev (Default)

* **Database:** Built-in PostgreSQL
* **Use case:** Standard deployments with managed database
* **Components:**
  * Trigger.dev container
  * Built-in PostgreSQL container
  * Automatic database configuration and health checks

### Trigger.dev with External Database

* **Database:** External (user-provided)
* **Use case:** Advanced deployments with existing database infrastructure or custom database configurations
* **Components:**
  * Trigger.dev container
  * Requires `DATABASE_URL` environment variable pointing to your external database

## Links

* [Official Website](https://trigger.dev)
* [GitHub](https://github.com/triggerdotdev/trigger.dev)

---

---
url: /docs/services/triliumnext.md
description: >-
  Organize notes on Coolify with TriliumNext for hierarchical note-taking,
  scripting, encryption, and powerful knowledge management features.
---

# TriliumNext

## What is TriliumNext?

TriliumNext is a hierarchical note taking application that helps you build your personal knowledge base. It features a tree-like structure for organizing notes, supports rich text editing, code snippets, images, and file attachments. TriliumNext includes powerful features like full-text search, note linking, scripting capabilities, and synchronization across multiple devices, making it ideal for personal knowledge management and documentation.

## Links

* [GitHub](https://github.com/TriliumNext/Trilium?utm_source=coolify.io)

---

---
url: /docs/troubleshoot/overview.md
description: >-
  Comprehensive Coolify troubleshooting guides covering deployment errors,
  server issues, proxy problems, SSL certificates, and application configuration
  fixes.
---

# ðŸ”§ Troubleshooting

This section provides solutions for resolving issues you might encounter with Coolify.

Check the sidebar for a list of all available trouble shooting guides.

::: warning Note:
**Please note that this troubleshooting guide is still being actively developed.**
:::

If you have a suggestion for a new troubleshooting guide or want to contribute, feel free to submit a pull request or open an issue with a detailed description in our GitHub [docs repository](https://github.com/coollabsio/documentation-coolify/issues).

---

---
url: /docs/services/typesense.md
description: >-
  Search instantly on Coolify with Typesense for typo-tolerant search engine,
  faceting, filtering, and lightning-fast full-text search API.
---

## What is Typesense?

Typesense is an open-source, typo-tolerant search engine optimized for instant (typically sub-50ms) search-as-you-type experiences and developer productivity.

If you've heard about ElasticSearch or Algolia, a good way to think about Typesense is that it is:

* An open source alternative to Algolia, with some key quirks solved and
* An easier-to-use batteries-included alternative to ElasticSearch

## Links

* [The official website](https://typesense.org/?utm_source=coolify.io)
* [GitHub](https://github.com/typesense/typesense?utm_source=coolify.io)

---

---
url: /docs/services/umami.md
description: >-
  Track analytics on Coolify with Umami for privacy-focused website analytics,
  visitor insights, and cookieless web traffic monitoring.
---

![Umami](https://raw.githubusercontent.com/umami-software/umami/refs/heads/master/public/mstile-150x150.png)

## What is Umami?

Umami is an open source, privacy-focused alternative to Google Analytics.

## Screenshots

![Umami Analytics](https://raw.githubusercontent.com/umami-software/website/refs/heads/master/public/images/preview-website-stats.png)

![Umami Sessions](https://raw.githubusercontent.com/umami-software/website/refs/heads/master/public/images/preview-session-stats.png)

![Umami Journey](https://raw.githubusercontent.com/umami-software/website/refs/heads/master/public/images/blog/user-journey.png)

## Links

* [Official Website](https://umami.is)
* [GitHub](https://github.com/umami-software/umami)

---

---
url: /docs/get-started/uninstallation.md
description: >-
  Completely remove Coolify from your self-hosted server by stopping containers,
  deleting volumes, networks, data directories, and Docker images.
---

If you're using [Coolify Cloud](https://coolify.io/pricing/), you don't need to uninstall Coolify since the Coolify Team manages everything on their servers.

To stop using Coolify Cloud, simply visit the [Billing page](https://app.coolify.io/subscription/) and cancel your subscription.

For those who **self-host** Coolify and wish to remove it from your server, follow the steps below to uninstall it safely:

* [Stop and Remove Containers](#_1-stop-and-remove-containers)
* [Remove Docker Volumes](#_2-remove-docker-volumes)
* [Remove Docker Network](#_3-remove-docker-network)
* [Delete Coolify Data Directory](#_4-delete-coolify-data-directory)
* [Remove Docker Images](#_5-remove-docker-images)

## 1. Stop and Remove Containers

Stop all Coolify-related Docker containers and remove them to free up system resources.

Run the following commands in your terminal:

```sh
sudo docker stop -t 0 coolify coolify-realtime coolify-db coolify-redis coolify-proxy coolify-sentinel
sudo docker rm coolify coolify-realtime coolify-db coolify-redis coolify-proxy coolify-sentinel
```

The `-t 0` flag ensures that the containers stop immediately without waiting for a timeout.

## 2. Remove Docker Volumes

To remove the persistent data stored in Docker volumes for Coolify, run:

```sh
sudo docker volume rm coolify-db coolify-redis
```

::: danger CAUTION!!
Removing volumes will delete all data stored in them permanently. Ensure you have backups if needed.
:::

## 3. Remove Docker Network

Coolify uses a custom Docker network named coolify. Remove it with the following command:

```sh
sudo docker network rm coolify
```

::: info Info
If you encounter an error indicating the network is in use, ensure that no containers are using the network before retrying.
:::

## 4. Delete Coolify Data Directory

Remove the directory where Coolify stores its data on your server:

```sh
  sudo rm -rf /data/coolify
```

::: danger CAUTION!
This will permanently delete all Coolify-related data. Double-check the directory path before executing this command.
:::

## 5. Remove Docker Images

To free up disk space, remove all Docker images used by Coolify by running the following commands:

```sh
sudo docker rmi ghcr.io/coollabsio/coolify:latest
sudo docker rmi ghcr.io/coollabsio/coolify-helper:latest
sudo docker rmi quay.io/soketi/soketi:1.6-16-alpine
sudo docker rmi postgres:15-alpine
sudo docker rmi redis:alpine
```

If you were using the default proxy, also remove its image:

```sh
sudo docker rmi traefik:v3.1
```

If you switched to the Caddy proxy, remove its image instead:

```sh
sudo docker rmi lucaslorentz/caddy-docker-proxy:2.8-alpine
```

***

### Coolify Successfully Uninstalled

After completing these steps, Coolify and all its related resources will be completely removed from your server.

---

---
url: /docs/services/unleash.md
description: >-
  Manage features on Coolify with Unleash for feature toggles, A/B testing,
  gradual rollouts, and enterprise feature flag management.
---

![Unleash](https://raw.githubusercontent.com/Unleash/unleash/main/.github/github_header_opaque_landscape.svg)

## What is Unleash?

Unleash is an open source feature flagging service.

## Deployment Variants

Unleash is available in two deployment configurations in Coolify:

### Unleash with PostgreSQL

* **Database:** PostgreSQL
* **Use case:** Standard deployments with managed database
* **Components:**
  * Unleash container
  * PostgreSQL container
  * Automatic database configuration and health checks

### Unleash without Database

* **Database:** External (user-provided)
* **Use case:** Advanced deployments with existing database infrastructure or custom database configurations
* **Components:**
  * Unleash container
  * Requires external database connection configuration

## Screenshots

![Unleash Preview](https://raw.githubusercontent.com/Unleash/unleash/main/.github/github_online_demo.svg)

## Links

* [Official Website](https://getunleash.io)
* [GitHub](https://github.com/unleash/unleash)

---

---
url: /docs/services/unsend.md
description: >-
  Send emails on Coolify with Unsend for developer-focused email API, templates,
  testing, and transactional email delivery service.
---

# Unsend

## What is Unsend

Unsend is an open-source alternative to Resend, Sendgrid, Mailgun and Postmark etc.

## Links

* [Official Documentation](https://docs.usesend.com/self-hosting/overview?utm_source=coolify.io)

---

---
url: /docs/services/unstructured.md
description: >-
  Extract data on Coolify with Unstructured.io for document parsing, PDFs,
  images, HTML, and ML-ready data preprocessing pipelines.
---

# What is Unstructured?

Unstructured provides a platform and tools to ingest and process unstructured documents for Retrieval Augmented Generation (RAG) and model fine-tuning.

## Videos

## Links

* [GitHub](https://github.com/Unstructured-IO/unstructured-api?utm_source=coolify.io)

---

---
url: /docs/get-started/upgrade.md
description: >-
  Upgrade self-hosted Coolify automatically, semi-automatically with UI
  notifications, or manually via terminal with version-specific installation.
---

If you're using [Coolify Cloud](https://coolify.io/pricing/), the Coolify team handles all updates so you donâ€™t need to worry about them.

For those who **self-host** Coolify, there are three ways to upgrade your instance:

* [Automatic Upgrade:](#_1-automatic-upgrade) For users who want easy, hands-off updates.
* [Semi-Automatic Upgrade:](#_2-semi-automatic-upgrade) For users who want control over when to apply updates.
* [Manual Upgrade:](#_3-manual-upgrade) For advanced users who prefer to manage the upgrade process themselves.

:::danger **Backup First!**

> **Always back up your Coolify data before starting an upgrade.**
> :::

## 1. Automatic Upgrade

Coolify can update itself automatically. This option keeps your instance always up-to-date without any extra effort.

### How it works?

Coolify periodically checks the [CDN](https://cdn.coollabs.io/coolify/versions.json) for updates. When a new version is available, it automatically fetches the latest release from the [official repository](https://github.com/orgs/coollabsio/packages?repo_name=coolify) and starts the upgrade process on its own.

### Customize Automatic Updates

If youâ€™d rather manage updates yourself, you can disable auto-updates in your Coolify dashboardâ€™s Settings.

::: info Tip
Turning off automatic updates lets you test a new version on a staging setup before updating your live environment.
:::

## 2. Semi-Automatic Upgrade

This option gives you a bit more control. Coolify notifies you when an update is available, and you decide when to apply it.

### How it works?

Coolify periodically checks the [CDN](https://cdn.coollabs.io/coolify/versions.json) for updates. When a new version is available, you will see an "**Upgrade**" button in the sidebar of your Coolify dashboard.

Click the upgrade button to start the update process.

### Set Update Frequency

You can also choose how often Coolify checks for updates by adjusting the settings (daily, weekly, etc.).

::: info Tip:
This method is perfect if you want to review update details or test the upgrade before applying it.
:::

## 3. Manual Upgrade

For those who prefer full control, you can upgrade Coolify manually.

### How to do this?

Open your server's terminal and run the command below:

```sh
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

To upgrade to a specific version, run the following command in your terminal:

```sh
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash -s 4.0.0-beta.400
```

Replace `4.0.0-beta.400` with the version number you want to upgrade to.

### How it works?

This command runs the official [Coolify installation script](https://github.com/coollabsio/coolify/blob/main/scripts/install.sh). The script checks the [CDN](https://cdn.coollabs.io/coolify/versions.json) for the latest version and updates your Coolify Instance.

::: success Tip
In the Automatic and Semi-Automatic methods, Coolify runs the installation script automatically in the background.

In the Manual upgrade method, you run the script yourself.
:::

---

---
url: /docs/services/uptime-kuma.md
description: >-
  Monitor uptime on Coolify with Uptime Kuma for status pages, notifications,
  SSL checks, and beautiful server monitoring dashboard.
---

# What is Uptime Kuma?

Uptime Kuma is an easy-to-use, privacy-focused uptime monitoring service.

## Screenshots

![Uptime Kuma Preview](https://user-images.githubusercontent.com/1336778/212262296-e6205815-ad62-488c-83ec-a5b0d0689f7c.jpg)

## Links

* [GitHub](https://github.com/louislam/uptime-kuma?tab=readme-ov-file)

---

---
url: /docs/get-started/usage.md
description: >-
  Compare Coolify Cloud managed service starting at $5/month versus free
  self-hosted deployment with maintenance, support, and backup differences.
---

So, youâ€™ve decided to use Coolify, awesome choice!

Now, you might be wondering whether to go with **Coolify Cloud** or set it up yourself through **self-hosting**. Letâ€™s break it down so you can pick the best option for you.

## Coolify Cloud

Coolify Cloud is the easy way to get started. Itâ€™s a paid service (starting at just **$5 a month**) where you bring your own servers and connect them to a Coolify instance thatâ€™s fully managed by our team.

::: warning **Note**
**We host and update the Coolify instance for you, so you don't have to allocate any of your server resources to Coolify, but youâ€™re still responsible for your own servers and any other services running on them**
:::

## Coolify Self-Hosted

If youâ€™re more of a hands-on person, self-hosting Coolify might be your thing.

Itâ€™s completely free (except for your server costs, of course), and you get to control everything.

Youâ€™ll install Coolify on your own server, keep it updated, and manage all the related services yourself.

## How Do They Compare?

*All of the features below refer only to the Coolify instance, not your entire server or other services.*

| Feature                 | Coolify Cloud                                                       | Self-Hosted Coolify                                       |
| ----------------------- | ------------------------------------------------------------------- | --------------------------------------------------------- |
| **Maintenance**         | We take care of hosting and updating the Coolify instance for you   | Youâ€™re in charge of keeping the instance running smoothly |
| **Support**             | Help from Coolify experts and our core team                         | Chat with the community on Discord                        |
| **Email Notifications** | Pre-configured and ready to use for free                            | Youâ€™ll need to set this up yourself                       |
| **Backups**             | We handle automatic backups for your Coolify instance               | Set up your own backup system for the Coolify instance    |
| **High Availability**   | Weâ€™ve got you covered with reliable uptime for the Coolify instance | Depends on how you set things up                          |
| **Stability**           | We test updates thoroughly before rolling them out                  | Test updates yourself before upgrading                    |
| **Cost**                | Starts at **$5/month**                                              | Free forever (just pay for your server)                   |

And just so you know, we donâ€™t play the â€œ**feature lock**â€ game. Whether you choose Coolify Cloud or self-host, you get all the same powerful features.

Weâ€™re all about giving you the full Coolify experience, no matter which path you take.

## Which One is Right for You?

If you want a quick, easy setup and donâ€™t mind paying a small fee for convenience, **Coolify Cloud** is perfect.

But if you love getting hands-on, want to save every penny, and enjoy being in full control, **Self-Hosting** is the way to go.

If you're still not sure which path to take, join our [Discord community](https://coolify.io/discord) and ask any questions you might have! We're here to help you decide what's best for your needs.

---

---
url: /docs/knowledge-base/how-to/wordpress-multisite.md
description: >-
  Configure WordPress Multisite in Coolify with subdomain or subdirectory setup,
  persistent storage, and network configuration
---

# Using WordPress Multisite with Coolify

1. Add WordPress with one-click installation
   Add a WordPress service with the one-click installation feature in Coolify.

2. Persist WordPress files on the host machine
   Change the following lines in your `docker-compose.yml` file from the UI to persist the WordPress files on the host machine:
   ```yaml
   volumes:
     - "wordpress-files:/var/www/html"
   ```
   to:
   ```yaml
   volumes:
     - "./wordpress:/var/www/html"
   ```
   This will mount the `wordpress` directory in the default configuration directory (`/data/coolify/services/<serviceUuid>/`) to the `/var/www/html` directory in the container. This way, you can edit the files on your host machine and see the changes reflected in the container.

3. Configure WordPress
   Start the Wordpress service and configure it as you wish.

4. Disable all plugins
   * Go to your WordPress admin panel.
   * Go to `Plugins` -> `Installed Plugins`.
   * Select all plugins and choose `Deactivate` from the dropdown menu.

5. Enable Multisite
   Open your `wp-config.php` file on the server and add the following lines:
   ```php
     define( 'WP_ALLOW_MULTISITE', true );
   ```
   Refresh your WordPress panel in your browser. You should now see a new menu item called `Network Setup` under the `Tools` menu.

---

---
url: /docs/services/vaultwarden.md
description: >-
  Store passwords on Coolify with Vaultwarden unofficial Bitwarden server for
  encrypted password vaults, 2FA, and credential management.
---

![Vaultwarden](https://raw.githubusercontent.com/dani-garcia/vaultwarden/040e2a7bb0f2cc5012d46ca99283cf21fa06ed1a/resources/vaultwarden-logo-white.svg)

## What is Vaultwarden?

Vaultwarden is an open source, self-hosted password manager.

## Links

* [GitHub](https://github.com/dani-garcia/vaultwarden)

---

---
url: /docs/services/vert.md
description: >-
  Deploy Vert.x on Coolify for reactive applications, microservices,
  event-driven architecture, and polyglot JVM framework development.
---

## What is Vert?

VERT is a file conversion utility that uses WebAssembly to convert files on your device instead of a cloud.

## Links

* [The official website](https://vert.sh/?utm_source=coolify.io)
* [GitHub](https://github.com/VERT-sh/VERT?utm_source=coolify.io)

---

---
url: /docs/services/vikunja.md
description: >-
  Manage tasks on Coolify with Vikunja for to-do lists, kanban boards, gantt
  charts, calendars, and team project organization.
---

![Vikunja](https://vikunja.cloud/images/vikunja-logo.svg)

## What is Vikunja?

Vikunja is an open source, self-hosted, task management application.

## Deployment Variants

Vikunja is available in two deployment configurations in Coolify:

### Vikunja (Default)

* **Database:** SQLite (embedded)
* **Use case:** Simple deployments, testing, or personal task management
* **Components:** Single Vikunja container with built-in SQLite database

### Vikunja with PostgreSQL

* **Database:** PostgreSQL
* **Use case:** Production deployments requiring better performance, concurrent access, and scalability
* **Components:**
  * Vikunja container
  * PostgreSQL container
  * Automatic database configuration and health checks

## Screenshots

![Vikunja Preview](https://vikunja.io/_astro/09-task-detail-dark.ppLbej6M_ZzaSch.avif)

## Links

* [Official Website](https://vikunja.io)
* [GitHub](https://kolaente.dev/vikunja/vikunja)

---

---
url: /docs/applications/vite.md
description: >-
  Deploy Vite applications on Coolify with TypeScript or JavaScript, Nixpacks
  build process, and static site generation.
---

# Vite

Vite is a build tool that aims to provide a faster and leaner development experience for modern web projects.

[Example repository.](https://github.com/coollabsio/coolify-examples/tree/main/vite)

## Vanilla TypeScript build (Static)

* Set `Build Pack` to `nixpacks`.
* Enable `Is it a static site?`.
* Set `Publish Directory` to `dist`.

## Vanilla JavaScript build (Static)

* Set `Build Pack` to `nixpacks`.
* Enable `Is it a static site?`.
* Set `Publish Directory` to `dist`.

---

---
url: /docs/applications/vitepress.md
description: >-
  Deploy VitePress documentation sites on Coolify with Vite, Vue, Nixpacks, and
  static site generation from Markdown files.
---

# VitePress

Vite & Vue Powered Static Site Generator Markdown to Beautiful Docs in Minutes.

[Example repository.](https://github.com/coollabsio/coolify-examples/tree/main/vitepress)

## Build (Static)

* Use `Nixpacks`.
* Turn on `Is it a static site?`.
* Set `Base Directory` to `/.vitepress/static`.
* Set `Publish Directory` to `/.vitepress/dist`.

---

---
url: /docs/applications/vuejs.md
description: >-
  Deploy Vue.js applications on Coolify with server builds using Node/Express or
  static SPA builds with routing support.
---

# Vue

Vue.js is an approachable, performant and versatile framework for building web user interfaces.

[Example repository.](https://github.com/coollabsio/coolify-examples/tree/main/vue)

## Server build (NodeJS|Express)

* Set `Build Pack` to `nixpacks`.
* Set 'Start Command`to`node server.js\`.

## Static build (SPA)

* Set `Build Pack` to `nixpacks`.
* Enable `Is it a static site?`.
* Set `Output Directory` to `dist`.

## Static build with Router (SPA)

* Set `Build Pack` to `nixpacks`.
* Enable `Is it a static site?`.
* Set `Output Directory` to `dist`.

---

---
url: /docs/services/vvveb.md
description: >-
  Build websites on Coolify with VvvebJs drag-and-drop website builder,
  templates, and visual web design tool without coding required.
---

# Vvveb

## What is Vvveb

Powerful and easy to use cms to build websites, blogs or ecommerce stores.

## Deployment Variants

Vvveb is available in three deployment configurations in Coolify:

### Vvveb (Default)

* **Database:** SQLite (embedded)
* **Use case:** Simple deployments, testing, or small websites
* **Components:** Single Vvveb container with built-in SQLite database

### Vvveb with MySQL

* **Database:** MySQL
* **Use case:** Production deployments with MySQL preference
* **Components:**
  * Vvveb container
  * MySQL container
  * Automatic database configuration and health checks

### Vvveb with MariaDB

* **Database:** MariaDB
* **Use case:** Production deployments with MariaDB preference
* **Components:**
  * Vvveb container
  * MariaDB container
  * Automatic database configuration and health checks

## Links

* [Official Documentation](https://docs.vvveb.com?utm_source=coolify.io)

---

---
url: /docs/services/wakapi.md
description: >-
  Track coding time on Coolify with Wakapi for WakaTime-compatible time
  tracking, statistics, and developer productivity analytics.
---

# Wakapi

## What is Wakapi

A minimalist, self-hosted WakaTime-compatible backend for coding statistics

## Links

* [Official Documentation](https://wakapi.dev/?utm_source=coolify.io)

---

---
url: /docs/services/weaviate.md
description: >-
  Deploy Weaviate vector database on Coolify for AI-powered search, semantic
  understanding, ML model integration, and knowledge graphs.
---

## What is Weaviate?

Weaviate (we-vee-eight) is an open source, AI-native vector database. Use this documentation to get started with Weaviate and to learn how to get the most out of Weaviate's features.

## Links

* [The official website](https://weaviate.io/?utm_source=coolify.io)
* [GitHub](https://github.com/weaviate/weaviate?utm_source=coolify.io)

---

---
url: /docs/services/web-check.md
description: >-
  Analyze websites on Coolify with Web-Check for SSL, DNS, headers, security,
  performance audits, and comprehensive site investigation.
---

# Web Check

## What is Web Check

All-in-one OSINT tool for analysing any website

## Links

* [Official Documentation](https://github.com/lissy93/web-check?utm_source=coolify.io)

---

---
url: /docs/services/weblate.md
description: >-
  Translate software on Coolify with Weblate for continuous localization,
  collaboration, version control, and open-source translation management.
---

![Weblate](https://camo.githubusercontent.com/2143626e8516dcee05bd0dab52c5e981bcd79defc10a6a56a7384b747f49a6d3/68747470733a2f2f732e7765626c6174652e6f72672f63646e2f4c6f676f2d4461726b746578742d626f72646572732e706e67)

## What is Weblate?

Weblate is an open source, self-hosted, translation management system.

## Screenshots

![Weblate Preview](https://weblate.org/static/img/BigScreenshot.png)

## Links

* [Official Website](https://weblate.org)
* [GitHub](https://github.com/WeblateOrg/weblate)

---

---
url: /docs/services/whoogle.md
description: >-
  Search Google privately on Coolify with Whoogle for anonymous Google searches
  without tracking, ads, or AMP with self-hosted proxy.
---

![Whoogle](https://raw.githubusercontent.com/benbusby/whoogle-search/main/docs/banner.png)

## What is Whoogle?

Whoogle is an open source, self-hosted, privacy-respecting, ad-free, and de-googled search engine.

## Links

* [GitHub](https://github.com/benbusby/whoogle-search)

---

---
url: /docs/services/wikijs.md
description: >-
  Deploy Wiki.js on Coolify for modern wiki with markdown, Git sync, powerful
  search, and beautiful documentation platform interface.
---

# Wikijs

## What is Wikijs

The most powerful and extensible open source Wiki software.

## Links

* [Official Documentation](https://docs.requarks.io?utm_source=coolify.io)

---

---
url: /docs/knowledge-base/proxy/traefik/wildcard-certs.md
description: >-
  Configure Let's Encrypt wildcard SSL certificates with Traefik DNS challenge
  using Cloudflare, Hetzner, or other providers for automatic subdomain
  coverage.
---

# Setup Wildcard SSL Certificates with Traefik

## Prerequisites

* You need to have a domain name and a DNS provider that supports wildcard subdomains.
* You need to use [dnsChallenge](https://doc.traefik.io/traefik/https/acme/#dnschallenge) in Traefik to get wildcard certificates from Let's Encrypt.
* You need to use one of the supported DNS [providers](https://doc.traefik.io/traefik/https/acme/#providers).

::: tip Tip
Each provider needs environment variables to be set in the Traefik configuration. You can find the required variables in the [official documentation](https://doc.traefik.io/traefik/https/acme/#providers).

If you need fine-grained token, like with [Cloudflare](https://go-acme.github.io/lego/dns/cloudflare/), check the provider configurations.
:::

## Configuration

1. Setup your wildcard subdomain DNS records, `*.coolify.io`.
2. Go to your Proxy settings (Servers / Proxy menu) and add the following configuration based on your [providers](https://doc.traefik.io/traefik/https/acme/#providers). The example will use `Hetzner` as a provider.

```bash
version: '3.8'
networks:
  coolify:
    external: true
services:
  traefik:
    container_name: coolify-proxy
    image: 'traefik:v2.10'
    restart: unless-stopped
    environment:
      - HETZNER_API_KEY=<API Key>
    extra_hosts:
      - 'host.docker.internal:host-gateway'
    networks:
      - coolify
    ports:
      - '80:80'
      - '443:443'
      - '8080:8080'
    healthcheck:
      test: 'wget -qO- http://localhost:80/ping || exit 1'
      interval: 4s
      timeout: 2s
      retries: 5
    volumes:
      - '/var/run/docker.sock:/var/run/docker.sock:ro'
      - '/data/coolify/proxy:/traefik'
    command:
      - '--ping=true'
      - '--ping.entrypoint=http'
      - '--api.dashboard=true'
      - '--api.insecure=false'
      - '--entrypoints.http.address=:80'
      - '--entrypoints.https.address=:443'
      - '--entrypoints.http.http.encodequerysemicolons=true'
      - '--entrypoints.https.http.encodequerysemicolons=true'
      - '--providers.docker.exposedbydefault=false'
      - '--providers.file.directory=/traefik/dynamic/'
      - '--providers.file.watch=true'
      # use dnschallenge instead of httpchallenge
      # - '--certificatesresolvers.letsencrypt.acme.httpchallenge=true'
      # - '--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=http'
      - '--certificatesresolvers.letsencrypt.acme.dnschallenge.provider=hetzner'
      - '--certificatesresolvers.letsencrypt.acme.dnschallenge.delaybeforecheck=0'
      - '--certificatesresolvers.letsencrypt.acme.storage=/traefik/acme.json'
      - '--providers.docker=true'
    labels:
      - traefik.enable=true
      - traefik.http.routers.traefik.entrypoints=http
      - traefik.http.routers.traefik.middlewares=traefik-basic-auth@file
      - traefik.http.routers.traefik.service=api@internal
      - traefik.http.routers.traefik.tls.certresolver=letsencrypt
      - traefik.http.routers.traefik.tls.domains[0].main=coolify.io
      - traefik.http.routers.traefik.tls.domains[0].sans=*.coolify.io
      - traefik.http.services.traefik.loadbalancer.server.port=8080
      - traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https
      - traefik.http.middlewares.gzip.compress=true
```

> You can also set `env_file` instead of `environment` in the example above, but then you need to create a `.env` file with the `HETZNER_API_KEY` variable on the server.

> Change `--certificatesresolvers.letsencrypt.acme.dnschallenge.provider=hetzner` to your provider.

Now you have two options to configure your wildcard subdomain for your resources.

### Normal

If you would like to use one (wildcard) certificate for all of your resources, you can use this option.

It is useful, because Traefik do not need to generate a new certificate for every resource, so new deployments will be available immediately without waiting for the certificate generation.

* In your application, set your FQDN to a subdomain you would like to use: `https://example.coolify.io`.

```bash
traefik.enable=true
traefik.http.routers.<unique_router_name_https>.rule=Host(`example.coolify.io`) && PathPrefix(`/`)
traefik.http.routers.<unique_router_name_https>.entryPoints=https
traefik.http.routers.<unique_router_name_https>.middlewares=gzip
traefik.http.routers.<unique_router_name_https>.service=<unique_service_name>
traefik.http.routers.<unique_router_name_https>.tls=true
traefik.http.services.<unique_service_name>.loadbalancer.server.port=80
traefik.http.routers.<unique_router_name_https>.tls.certresolver=letsencrypt

traefik.http.routers.<unique_router_name_http>.rule=Host(`example.coolify.io`) && PathPrefix(`/`)
traefik.http.routers.<unique_router_name_http>.entryPoints=http
traefik.http.routers.<unique_router_name_http>.middlewares=redirect-to-https
```

### SaaS

Redirect all subdomains to one application. You can use this option if you want to use Coolify as a SaaS provider.

* In your application, leave the FQDN configuration `empty`.
* Add the following custom label configuration:

:::tabs key:saas
\== Traefik v3

```bash
traefik.enable=true
traefik.http.routers.<unique_router_name_https>.rule=HostRegexp(`^.+\.coolify\.io$`)
traefik.http.routers.<unique_router_name_https>.entryPoints=https
traefik.http.routers.<unique_router_name_https>.middlewares=gzip
traefik.http.routers.<unique_router_name_https>.service=<unique_service_name>
traefik.http.routers.<unique_router_name_https>.tls.certresolver=letsencrypt
traefik.http.services.<unique_service_name>.loadbalancer.server.port=80
traefik.http.routers.<unique_router_name_https>.tls=true

traefik.http.routers.<unique_router_name_http>.rule=HostRegexp(`^.+\.coolify\.io$`)
traefik.http.routers.<unique_router_name_http>.entryPoints=http
traefik.http.routers.<unique_router_name_http>.middlewares=redirect-to-https
```

\== Traefik v2

```bash
traefik.enable=true
traefik.http.routers.<unique_router_name_https>.rule=HostRegexp(`{subdomain:[a-zA-Z0-9-]+}.coolify.io`)
traefik.http.routers.<unique_router_name_https>.entryPoints=https
traefik.http.routers.<unique_router_name_https>.middlewares=gzip
traefik.http.routers.<unique_router_name_https>.service=<unique_service_name>
traefik.http.routers.<unique_router_name_https>.tls.certresolver=letsencrypt
traefik.http.services.<unique_service_name>.loadbalancer.server.port=80
traefik.http.routers.<unique_router_name_https>.tls=true

traefik.http.routers.<unique_router_name_http>.rule=HostRegexp(`{subdomain:[a-zA-Z0-9-]+}.coolify.io`)
traefik.http.routers.<unique_router_name_http>.entryPoints=http
traefik.http.routers.<unique_router_name_http>.middlewares=redirect-to-https
```

:::

> `traefik.http.routers.<unique_router_name_https>.tls.certresolver` should be the same as your `certresolver` name in Traefik proxy configuration, by default `letsencrypt`.

> `traefik.http.services.<unique_service_name>.loadbalancer.server.port` should be the same as your application listens on. Port 80 if you use a static deployment.

::: warning Caution
You cannot use both configurations (Normal & SaaS) at the same time on one
server.
:::

---

---
url: /docs/services/windmill.md
description: >-
  Build workflows on Coolify with Windmill for scripts, flows, UIs, and
  developer-centric workflow automation with TypeScript/Python.
---

![Windmill](https://raw.githubusercontent.com/windmill-labs/windmill/main/imgs/windmill-banner.png)

## What is Windmill?

Windmill is an open-source developer platform to power your entire infra and turn scripts into webhooks, workflows and UIs. Fastest workflow engine (13x vs Airflow). Open-source alternative to Retool and Temporal.

## Screenshots

![Windmill Preview](https://raw.githubusercontent.com/windmill-labs/windmill/main/imgs/windmill-editor.png)

![Windmill Preview 2](https://raw.githubusercontent.com/windmill-labs/windmill/main/imgs/windmill-run.png)

![Windmill Preview 3](https://raw.githubusercontent.com/windmill-labs/windmill/main/imgs/windmill-flow.png)

## Links

* [Official Website](https://windmill.dev)
* [GitHub](https://github.com/windmill-labs/windmill)

---

---
url: /docs/services/wireguard-easy.md
description: >-
  Deploy WireGuard VPN on Coolify with WireGuard Easy for simple VPN setup,
  client management, and secure network tunneling interface.
---

# Wireguard Easy

## What is Wireguard Easy

The easiest way to run WireGuard VPN + Web-based Admin UI.

## Links

* [Official Documentation](https://github.com/wg-easy/wg-easy?utm_source=coolify.io)

---

---
url: /docs/services/wordpress.md
description: >-
  Run WordPress on Coolify for blogging, CMS, e-commerce with plugins, themes,
  and world's most popular website building platform.
---

![WordPress](https://raw.githubusercontent.com/logo/wordpress/caefc9aa315eafcf8687804564a11a9c5a77a561/images/logo.svg)

## What is WordPress?

WordPress is a free and open-source content management system written in PHP and paired with a MySQL/MariaDB database.
It is used for creating websites, blogs, and applications.

## Deployment Variants

WordPress is available in two deployment configurations in Coolify:

### WordPress with MariaDB

* **Database:** MariaDB
* **Use case:** Production deployments with MariaDB preference (recommended for most users)
* **Components:**
  * WordPress container
  * MariaDB container
  * Automatic database configuration and health checks

### WordPress with MySQL

* **Database:** MySQL
* **Use case:** Production deployments with MySQL preference
* **Components:**
  * WordPress container
  * MySQL container
  * Automatic database configuration and health checks

Both variants provide equivalent functionality - choose based on your database preference or existing infrastructure.

## Links

* [The official website](https://wordpress.org)
* [GitHub](https://github.com/WordPress/WordPress)

## FAQ

### How to increase the upload size limit?

You can increase the upload size limit by following these steps:

1. Open the `.htaccess` file through Coolify's Terminal (or through SSH, and docker exec -ti `container_id` /bin/sh)
2. Add the following lines to the end of the file with `vi` or `nano`:

```php
# END WordPress - this line already exists in the file

php_value upload_max_filesize 256M
php_value post_max_size 256M
php_value max_execution_time 300
php_value max_input_time 300
```

3. Save and close the file.
4. Reload the website in your browser. The changes should be applied automatically.

### How to Fix a Redirection Loop in WordPress?

If your WordPress site is stuck in a redirection loop, follow these steps to resolve the issue:

Access the .htaccess file:

1. Open the `.htaccess` file through Coolify's Terminal (or through SSH, and docker exec -ti `container_id` /bin/sh)
2. Navigate to the WordPress root directory and locate the .htaccess file. Edit the .htaccess file:

```
<IfModule mod_setenvif.c>
  SetEnvIf X-Forwarded-Proto "^https$" HTTPS
</IfModule>
```

3. Save and close the file.
4. Reload the website in your browser. The changes should be applied automatically.

---

---
url: /docs/services/yamtrack.md
description: >-
  Track time on Coolify with YAMTrack for project time logging, invoicing,
  reports, and freelancer productivity management tool.
---

## What is Yamtrack?

Yamtrack is a self hosted media tracker for movies, tv shows, anime, manga, video games and books.

## Deployment Variants

Yamtrack is available in two deployment configurations in Coolify:

### Yamtrack (Default)

* **Database:** SQLite (embedded)
* **Use case:** Simple deployments, testing, or personal media tracking
* **Components:** Single Yamtrack container with built-in SQLite database

### Yamtrack with PostgreSQL

* **Database:** PostgreSQL
* **Use case:** Production deployments requiring better performance and data reliability
* **Components:**
  * Yamtrack container
  * PostgreSQL container
  * Automatic database configuration and health checks

## Screenshots

## Links

* [The official website](https://github.com/FuzzyGrim/Yamtrack/wiki?utm_source=coolify.io)
* [GitHub](https://github.com/FuzzyGrim/Yamtrack?utm_source=coolify.io)

---

---
url: /docs/services/zipline.md
description: >-
  Share files on Coolify with Zipline for screenshot sharing, file uploads, URL
  shortening, and personal media hosting with embeds.
---

![Zipline](https://raw.githubusercontent.com/diced/zipline/trunk/public/zipline_small.png)

## What is Zipline?

The next generation ShareX / File upload server
A ShareX/file upload server that is easy to use, packed with features, and with an easy setup!

## Screenshots

## Links

* [The official website](https://zipline.diced.sh/?utm_source=coolify.io)
* [GitHub](https://github.com/diced/zipline?utm_source=coolify.io)