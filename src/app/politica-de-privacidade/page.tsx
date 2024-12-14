export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>
      
      <div className="prose prose-lg">
        <p>
          Esta Política de Privacidade descreve como suas informações pessoais são coletadas, usadas e compartilhadas 
          quando você visita o Efeito Bola de Neve ("site", "nós", "nosso").
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Informações que coletamos</h2>
        <p>
          Quando você visita o site, coletamos automaticamente certas informações sobre seu dispositivo, incluindo 
          informações sobre seu navegador, endereço IP, fuso horário e alguns dos cookies que estão instalados em 
          seu dispositivo.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Cookies e tecnologias similares</h2>
        <p>
          Utilizamos os seguintes tipos de cookies e tecnologias similares:
        </p>
        <ul className="list-disc pl-6 mt-2">
          <li>
            <strong>Google Analytics:</strong> Para entender como os visitantes interagem com o site, coletando 
            informações sobre páginas visitadas, tempo de permanência e comportamento de navegação.
          </li>
          <li>
            <strong>Google Ads:</strong> Para exibir anúncios relevantes em outros sites que você visita e medir 
            a eficácia de nossas campanhas publicitárias.
          </li>
          <li>
            <strong>Google AdSense:</strong> Para exibir anúncios personalizados em nosso site com base em seus 
            interesses e comportamento de navegação.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Como usamos suas informações</h2>
        <p>
          Usamos as informações que coletamos para:
        </p>
        <ul className="list-disc pl-6 mt-2">
          <li>Melhorar e otimizar nosso site</li>
          <li>Analisar como os visitantes usam o site</li>
          <li>Personalizar sua experiência</li>
          <li>Exibir anúncios relevantes</li>
          <li>Detectar e prevenir fraudes</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Compartilhamento de informações</h2>
        <p>
          Compartilhamos suas informações com terceiros apenas nas seguintes situações:
        </p>
        <ul className="list-disc pl-6 mt-2">
          <li>Com provedores de serviços que nos ajudam a operar o site (como Google Analytics)</li>
          <li>Para cumprir obrigações legais</li>
          <li>Para proteger nossos direitos e propriedade</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Seus direitos</h2>
        <p>
          Você tem o direito de:
        </p>
        <ul className="list-disc pl-6 mt-2">
          <li>Acessar as informações pessoais que temos sobre você</li>
          <li>Solicitar a correção de informações incorretas</li>
          <li>Solicitar a exclusão de suas informações</li>
          <li>Optar por não receber comunicações de marketing</li>
          <li>Configurar suas preferências de cookies</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Alterações</h2>
        <p>
          Podemos atualizar esta política de privacidade periodicamente para refletir mudanças em nossas práticas 
          ou por outros motivos operacionais, legais ou regulatórios.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Contato</h2>
        <p>
          Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco em{' '}
          <a href="mailto:contato@magicnumber.com.br" className="text-blue-600 hover:text-blue-800">
            contato@magicnumber.com.br
          </a>
        </p>

        <p className="mt-8 text-sm text-gray-600">
          Última atualização: 13 de dezembro de 2023
        </p>
      </div>
    </div>
  )
}
