import {SignJWT} from 'jose/jwt/sign'

export async function generateSignedJWT({alg, subject, issuer, audience, expiresAt, signature, payload}) {
    return await new SignJWT(payload || {})
        .setProtectedHeader({alg: alg || 'HS256'})
        .setIssuedAt()
        .setSubject(subject)
        .setIssuer(issuer)
        .setAudience(audience)
        .setJti(Math.random() + '' + new Date().getTime())
        .setExpirationTime(expiresAt || '5m')
        .sign(signature)
}
