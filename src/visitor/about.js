import React, { forwardRef } from 'react'

export default api => {
  return forwardRef((props, ref) => {
    return (
      <div id="about" ref={ref}>
        <img
          className="background-photo"
          src="/avatar-199818216_1197508730702208_1847080802409749734_n.jpg"
          alt=""
        />
        <blockquote className="about__quote">
          Інколи ми самі ставимо собі шлагбауми власною упередженістю. Подібно ж герою із "Завжди
          говори так" якщо впустити в життя розумну порцію авантюризму, можна отримати багато нових
          вражень та неоціненний досвід. — Софія Сало
        </blockquote>
      </div>
    )
  })
}
