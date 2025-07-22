export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
export OPENAI_API_KEY="sk-DooDic8VNPSee96jNsBvqj"
export OPENAI_API_BASE="https://api.manus.im/api/llm-proxy/v1"
export OPENAI_BASE_URL="https://api.manus.im/api/llm-proxy/v1"
cd /home/ubuntu && cd /home/ubuntu && unzip -q upload/lista-compras-webapp.zip && ls -la
cd /home/ubuntu && ls -la src
cd /home/ubuntu && ls -la src/contexts
cd /home/ubuntu && ls -la src/components
cd /home/ubuntu && ls -la src/pages
cd /home/ubuntu && npm install
cd /home/ubuntu && npm list react-icons
cd /home/ubuntu && ls -la src/utils
cd /home/ubuntu && npm run build
cd /home/ubuntu && ls -la build/
cd /home/ubuntu && zip -r lista-compras-webapp-updated.zip .
export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
export OPENAI_API_KEY="sk-DooDic8VNPSee96jNsBvqj"
export OPENAI_API_BASE="https://api.manus.im/api/llm-proxy/v1"
export OPENAI_BASE_URL="https://api.manus.im/api/llm-proxy/v1"
cd /home/ubuntu && rm -rf node_modules .cache
cd /home/ubuntu && zip -r lista-compras-webapp-updated.zip . -x "node_modules/*" -x ".cache/*" -x "upload/*"
