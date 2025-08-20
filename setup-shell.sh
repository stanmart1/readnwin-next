#!/bin/bash

# Add to ~/.zshrc to make nvm the default Node.js manager
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.zshrc
echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.zshrc

# Remove Homebrew node from PATH
echo 'export PATH=$(echo $PATH | tr ":" "\n" | grep -v node@20 | tr "\n" ":" | sed "s/:$//")'  >> ~/.zshrc

echo "✅ Shell configured. Restart terminal or run: source ~/.zshrc"